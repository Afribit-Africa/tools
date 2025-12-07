interface BatchConfig {
  batchSize: number;
  delayBetweenBatches: number;
  delayBetweenItems: number;
  maxRetries: number;
  retryDelay: number;
}

interface BatchItem {
  id: string;
  data: any;
}

interface BatchResult<T> {
  success: boolean;
  item: BatchItem;
  result?: T;
  error?: string;
  attempts: number;
}

export class OptimizedBatchProcessor<T> {
  private config: BatchConfig;
  private onProgress?: (current: number, total: number, item?: BatchItem) => void;
  private onBatchComplete?: (batchNumber: number, results: BatchResult<T>[]) => void;

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = {
      batchSize: config.batchSize || 50, // Process 50 items per batch
      delayBetweenBatches: config.delayBetweenBatches || 1000, // 1 second between batches
      delayBetweenItems: config.delayBetweenItems || 50, // 50ms between items
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 500,
    };
  }

  setProgressCallback(callback: (current: number, total: number, item?: BatchItem) => void) {
    this.onProgress = callback;
  }

  setBatchCompleteCallback(callback: (batchNumber: number, results: BatchResult<T>[]) => void) {
    this.onBatchComplete = callback;
  }

  async process(
    items: BatchItem[],
    processor: (item: BatchItem) => Promise<T>
  ): Promise<BatchResult<T>[]> {
    const allResults: BatchResult<T>[] = [];
    const batches = this.createBatches(items);
    const totalItems = items.length;
    let processedCount = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchResults: BatchResult<T>[] = [];

      for (const item of batch) {
        const result = await this.processWithRetry(item, processor);
        batchResults.push(result);
        processedCount++;

        if (this.onProgress) {
          this.onProgress(processedCount, totalItems, item);
        }

        // Delay between items (except last item in batch)
        if (item !== batch[batch.length - 1]) {
          await this.delay(this.config.delayBetweenItems);
        }
      }

      allResults.push(...batchResults);

      if (this.onBatchComplete) {
        this.onBatchComplete(batchIndex + 1, batchResults);
      }

      // Delay between batches (except last batch)
      if (batchIndex < batches.length - 1) {
        await this.delay(this.config.delayBetweenBatches);
      }
    }

    return allResults;
  }

  private async processWithRetry(
    item: BatchItem,
    processor: (item: BatchItem) => Promise<T>
  ): Promise<BatchResult<T>> {
    let attempts = 0;
    let lastError: string | undefined;

    while (attempts < this.config.maxRetries) {
      try {
        attempts++;
        const result = await processor(item);
        return {
          success: true,
          item,
          result,
          attempts,
        };
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        if (attempts < this.config.maxRetries) {
          await this.delay(this.config.retryDelay * attempts); // Exponential backoff
        }
      }
    }

    return {
      success: false,
      item,
      error: lastError,
      attempts,
    };
  }

  private createBatches(items: BatchItem[]): BatchItem[][] {
    const batches: BatchItem[][] = [];
    for (let i = 0; i < items.length; i += this.config.batchSize) {
      batches.push(items.slice(i, i + this.config.batchSize));
    }
    return batches;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Calculate estimated time
  static calculateEstimatedTime(
    itemCount: number,
    config: Partial<BatchConfig> = {}
  ): {
    totalSeconds: number;
    formattedTime: string;
    itemsPerSecond: number;
  } {
    const batchSize = config.batchSize || 50;
    const delayBetweenBatches = config.delayBetweenBatches || 1000;
    const delayBetweenItems = config.delayBetweenItems || 50;

    const batchCount = Math.ceil(itemCount / batchSize);
    const itemsInLastBatch = itemCount % batchSize || batchSize;

    // Time for all complete batches
    const completeTimePerBatch = batchSize * delayBetweenItems + delayBetweenBatches;
    const completeBatchesTime = (batchCount - 1) * completeTimePerBatch;

    // Time for last batch
    const lastBatchTime = itemsInLastBatch * delayBetweenItems;

    const totalMs = completeBatchesTime + lastBatchTime;
    const totalSeconds = Math.ceil(totalMs / 1000);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedTime =
      minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    const itemsPerSecond = itemCount / totalSeconds;

    return {
      totalSeconds,
      formattedTime,
      itemsPerSecond: parseFloat(itemsPerSecond.toFixed(2)),
    };
  }
}

// Specialized processor for payment batches
export class PaymentBatchProcessor extends OptimizedBatchProcessor<any> {
  constructor() {
    super({
      batchSize: 100, // Increased for payments
      delayBetweenBatches: 2000, // 2 seconds between batches
      delayBetweenItems: 100, // 100ms between payments
      maxRetries: 2,
      retryDelay: 1000,
    });
  }
}

// Specialized processor for validation batches
export class ValidationBatchProcessor extends OptimizedBatchProcessor<any> {
  constructor() {
    super({
      batchSize: 50,
      delayBetweenBatches: 500,
      delayBetweenItems: 50,
      maxRetries: 3,
      retryDelay: 500,
    });
  }
}

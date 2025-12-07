import { GraphQLClient } from 'graphql-request';
import type { BlinkAccount, PaymentResult } from '@/types';

const BLINK_API_URL = 'https://api.blink.sv/graphql';

export class BlinkPaymentClient {
  private client: GraphQLClient;

  constructor(apiKey: string) {
    this.client = new GraphQLClient(BLINK_API_URL, {
      headers: {
        'X-API-KEY': apiKey,
      },
    });
  }

  async getAccount(): Promise<BlinkAccount> {
    const query = `
      query Me {
        me {
          defaultAccount {
            wallets {
              id
              walletCurrency
              balance
            }
          }
        }
      }
    `;

    const response: any = await this.client.request(query);
    const wallets = response.me.defaultAccount.wallets;

    return {
      wallets: wallets,
      defaultWalletId: wallets[0]?.id || '',
    };
  }

  async sendToLightningAddress(
    walletId: string,
    lnAddress: string,
    amount: number
  ): Promise<PaymentResult> {
    const mutation = `
      mutation LnAddressPaymentSend($input: LnAddressPaymentSendInput!) {
        lnAddressPaymentSend(input: $input) {
          status
          errors {
            code
            message
            path
          }
        }
      }
    `;

    try {
      const response: any = await this.client.request(mutation, {
        input: {
          walletId,
          lnAddress,
          amount: amount.toString(),
        },
      });

      const result = response.lnAddressPaymentSend;

      if (result.errors && result.errors.length > 0) {
        return {
          success: false,
          address: lnAddress,
          amount,
          status: 'FAILED',
          error: result.errors[0].message,
        };
      }

      return {
        success: true,
        address: lnAddress,
        amount,
        status: result.status,
      };
    } catch (error) {
      return {
        success: false,
        address: lnAddress,
        amount,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  async probeFee(walletId: string, lnAddress: string, amount: number): Promise<number> {
    // Note: Blink doesn't have a direct fee probe for Lightning addresses
    // Intraledger (Blink-to-Blink) is always 0 fee
    // For external addresses, typical routing fee is ~0.02%
    return Math.ceil(amount * 0.0002); // Conservative estimate
  }
}

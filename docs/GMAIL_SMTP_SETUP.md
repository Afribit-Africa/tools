# Gmail SMTP Setup Guide for CBAF

## 📧 Get Your Gmail App Password (5 minutes)

### Step 1: Enable 2-Step Verification (if not already enabled)

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification**
4. Follow the prompts to enable it (you'll need your phone)

### Step 2: Generate App Password

1. Go directly to: **https://myaccount.google.com/apppasswords**

   OR

   - Go to https://myaccount.google.com/
   - Click **Security** → Scroll down to **2-Step Verification**
   - At the bottom, click **App passwords**

2. You may need to sign in again

3. In the "Select app" dropdown:
   - Choose **Mail** or **Other (Custom name)**
   - If "Other", enter: `CBAF Email Service`

4. In the "Select device" dropdown:
   - Choose **Other (Custom name)**
   - Enter: `CBAF Server`

5. Click **Generate**

6. Google will show you a **16-character password** like:
   ```
   abcd efgh ijkl mnop
   ```

7. **IMPORTANT**: Copy this password immediately (you can't see it again)

### Step 3: Add to .env file

Open `d:\Desktop\afribitools\.env` and update the line:

```env
SMTP_PASS=your-app-password-here
```

Replace with your 16-character password (remove spaces):

```env
SMTP_PASS=abcdefghijklmnop
```

**Example**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=afribitkibera@gmail.com
SMTP_PASS=abcdefghijklmnop
```

### Step 4: Test Email Service (Optional)

Create a test file `test-email.ts`:

```typescript
import { sendEmail } from '@/lib/email';

async function testEmail() {
  const result = await sendEmail({
    to: 'edmundspira@gmail.com', // Your test email
    subject: 'CBAF Email Test',
    html: '<h1>Test Email</h1><p>If you receive this, Gmail SMTP is working! 🎉</p>',
    text: 'Test Email - Gmail SMTP is working!',
    templateType: 'address_correction_request',
  });

  console.log('Email result:', result);
}

testEmail();
```

Run: `npx ts-node test-email.ts`

---

## 🔒 Security Notes

- **App passwords** are specific to one app/device
- They bypass 2-Step Verification
- You can revoke them anytime at: https://myaccount.google.com/apppasswords
- Never commit `.env` file to Git (it's in `.gitignore`)

---

## 📊 Gmail Sending Limits

- **Free Gmail**: 500 emails per day
- **Google Workspace**: 2,000 emails per day

For CBAF's use case (address correction emails + approval notifications), 500/day is more than sufficient.

---

## ❌ Troubleshooting

### Error: "Invalid login credentials"
- Double-check you copied the App Password correctly (no spaces)
- Make sure 2-Step Verification is enabled
- Try generating a new App Password

### Error: "Could not connect to SMTP server"
- Check your internet connection
- Verify SMTP_HOST=smtp.gmail.com
- Verify SMTP_PORT=587

### Error: "Sender address rejected"
- Make sure SMTP_USER matches the Gmail account that generated the App Password
- Check that the Gmail account is active

---

## ✅ Current Configuration

Your `.env` file should have:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=afribitkibera@gmail.com
SMTP_PASS=your-16-character-app-password
```

Once you add the `SMTP_PASS`, email notifications will work automatically throughout CBAF!

---

**Need Help?** Visit: https://support.google.com/accounts/answer/185833

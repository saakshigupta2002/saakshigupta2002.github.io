# EmailJS Setup Instructions

To enable the contact form to send emails, you need to set up EmailJS (it's free!).

## Step 1: Sign up for EmailJS
1. Go to https://www.emailjs.com/
2. Sign up for a free account (allows 200 emails/month)

## Step 2: Create an Email Service
1. Go to https://dashboard.emailjs.com/admin
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Copy your **Service ID** (e.g., `service_xxxxxxx`)

## Step 3: Create an Email Template
1. Go to https://dashboard.emailjs.com/admin/template/create
2. Create a new template with these variables:
   - `{{from_name}}` - Sender's name
   - `{{from_email}}` - Sender's email
   - `{{message}}` - Message content
   - `{{to_email}}` - Your email (saakshigupta2002@gmail.com)
3. Set the "To Email" field to: `{{to_email}}`
4. Set the "Subject" to something like: "New Contact Form Message from {{from_name}}"
5. In the message body, use:
   ```
   From: {{from_name}}
   Email: {{from_email}}
   
   Message:
   {{message}}
   ```
6. Save and copy your **Template ID** (e.g., `template_xxxxxxx`)

## Step 4: Get Your Public Key
1. Go to https://dashboard.emailjs.com/admin/integration
2. Copy your **Public Key** (e.g., `xxxxxxxxxxxxxxx`)

## Step 5: Update contact.html
Open `contact.html` and replace these placeholders:

1. Replace `YOUR_PUBLIC_KEY` with your Public Key (line ~103)
2. Replace `YOUR_SERVICE_ID` with your Service ID (line ~125)
3. Replace `YOUR_TEMPLATE_ID` with your Template ID (line ~125)

Example:
```javascript
emailjs.init("abc123xyz789"); // Your Public Key

emailjs.send('service_abc123', 'template_xyz789', formData) // Your Service ID and Template ID
```

## That's it!
Once you've updated the three values, your contact form will be fully functional and will send emails directly to saakshigupta2002@gmail.com!



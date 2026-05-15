import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jxdtecoknstswoeinizj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4ZHRlY29rbnN0c3dvZWluaXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MTAxMjQsImV4cCI6MjA5NDM4NjEyNH0.l5GBAWAM0BJ3gG0Q0yNUxzvE0bUC3rfelB24Shk4Xtc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── User Profile ────────────────────────────────────────────────────────────

export async function getOrCreateUser(privyId: string, email: string) {
  // Try to fetch existing user
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("privy_id", privyId)
    .single();

  if (existing) return existing;

  // Create new user with zero balance
  const accountNumber = `${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const { data: created, error } = await supabase
    .from("users")
    .insert({
      privy_id: privyId,
      email,
      balance: 0,
      account_number: accountNumber,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

export async function getUserBalance(privyId: string): Promise<number> {
  const { data } = await supabase
    .from("users")
    .select("balance")
    .eq("privy_id", privyId)
    .single();
  return data?.balance ?? 0;
}

export async function getUserByEmail(email: string) {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  return data;
}

export async function getUserByAccountNumber(accountNumber: string) {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("account_number", accountNumber)
    .single();
  return data;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function getTransactions(privyId: string) {
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .or(`sender_privy_id.eq.${privyId},receiver_privy_id.eq.${privyId}`)
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

export async function addTransaction(tx: {
  sender_privy_id: string;
  receiver_privy_id?: string;
  type: "send" | "receive" | "deposit" | "withdraw";
  amount: number;
  currency: string;
  note?: string;
  reference?: string;
  status: "pending" | "success" | "failed";
  recipient_label?: string;
}) {
  const { data, error } = await supabase
    .from("transactions")
    .insert({ ...tx, created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Send Money ───────────────────────────────────────────────────────────────

export async function sendMoney(
  senderPrivyId: string,
  recipientEmail: string,
  amount: number,
  note: string,
  currency: string
) {
  // 1. Get sender balance
  const { data: sender } = await supabase
    .from("users")
    .select("balance, email")
    .eq("privy_id", senderPrivyId)
    .single();

  if (!sender) throw new Error("Sender not found");
  if (sender.balance < amount) throw new Error("Insufficient balance");

  // 2. Find recipient
  const { data: recipient } = await supabase
    .from("users")
    .select("*")
    .eq("email", recipientEmail)
    .single();

  if (!recipient) throw new Error("Recipient not found. They must have a Susu account.");

  // 3. Deduct from sender
  await supabase
    .from("users")
    .update({ balance: sender.balance - amount })
    .eq("privy_id", senderPrivyId);

  // 4. Add to recipient
  await supabase
    .from("users")
    .update({ balance: recipient.balance + amount })
    .eq("id", recipient.id);

  // 5. Record transaction for sender
  await addTransaction({
    sender_privy_id: senderPrivyId,
    receiver_privy_id: recipient.privy_id,
    type: "send",
    amount,
    currency,
    note,
    status: "success",
    recipient_label: recipientEmail,
  });

  // 6. Record transaction for recipient
  await addTransaction({
    sender_privy_id: recipient.privy_id,
    receiver_privy_id: senderPrivyId,
    type: "receive",
    amount,
    currency,
    note,
    status: "success",
    recipient_label: sender.email,
  });

  return { success: true };
}

// ─── Deposit (after Paystack confirms) ───────────────────────────────────────

export async function recordDeposit(
  privyId: string,
  amount: number,
  currency: string,
  reference: string
) {
  // Get current balance
  const { data: user } = await supabase
    .from("users")
    .select("balance")
    .eq("privy_id", privyId)
    .single();

  if (!user) throw new Error("User not found");

  // Update balance
  await supabase
    .from("users")
    .update({ balance: user.balance + amount })
    .eq("privy_id", privyId);

  // Record transaction
  await addTransaction({
    sender_privy_id: privyId,
    type: "deposit",
    amount,
    currency,
    reference,
    status: "success",
  });
}

// ─── Withdrawal (Paystack Transfer) ──────────────────────────────────────────

export async function initiateWithdrawal(
  privyId: string,
  amount: number,
  currency: string,
  accountNumber: string,
  bankCode: string,
  accountName: string
) {
  // 1. Check balance
  const { data: user } = await supabase
    .from("users")
    .select("balance")
    .eq("privy_id", privyId)
    .single();

  if (!user) throw new Error("User not found");
  if (user.balance < amount) throw new Error("Insufficient balance");

  const fee = Math.max(amount * 0.005, 50);
  const totalDeduction = amount + fee;

  if (user.balance < totalDeduction) throw new Error("Insufficient balance including fees");

  // 2. Create Paystack transfer recipient
  const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
    method: "POST",
    headers: {
      Authorization: `Bearer sk_test_2df1e42a5e0f77a8b541b565f4228a7d712a50ed`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "nuban",
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    }),
  });

  const recipientData = await recipientRes.json();
  if (!recipientData.status) throw new Error(recipientData.message || "Failed to create recipient");

  const recipientCode = recipientData.data.recipient_code;

  // 3. Initiate transfer
  const transferRes = await fetch("https://api.paystack.co/transfer", {
    method: "POST",
    headers: {
      Authorization: `Bearer sk_test_2df1e42a5e0f77a8b541b565f4228a7d712a50ed`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: "balance",
      amount: amount * 100, // Paystack uses kobo
      recipient: recipientCode,
      reason: "Susu withdrawal",
    }),
  });

  const transferData = await transferRes.json();
  if (!transferData.status) throw new Error(transferData.message || "Transfer failed");

  // 4. Deduct from balance
  await supabase
    .from("users")
    .update({ balance: user.balance - totalDeduction })
    .eq("privy_id", privyId);

  // 5. Record transaction
  await addTransaction({
    sender_privy_id: privyId,
    type: "withdraw",
    amount,
    currency,
    reference: transferData.data.transfer_code,
    status: "pending",
    recipient_label: accountName,
  });

  return { success: true, reference: transferData.data.transfer_code };
}

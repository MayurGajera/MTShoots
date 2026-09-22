// Currency and localization formatting for MTShoots India

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

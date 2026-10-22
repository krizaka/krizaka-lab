import { NumberTicker } from "@krizaka/ui/number-ticker";
import { Stat } from "@krizaka/ui/stat";

export function Example() {
  return <Stat label="Plays this month" value={<NumberTicker value={5940} />} trend="up" trendLabel="+12 %" />;
}

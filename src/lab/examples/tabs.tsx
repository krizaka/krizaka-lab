import { Tabs } from "@krizaka/ui/tabs";

export function Example() {
  return (
    <Tabs.Root defaultValue="week" className="lab-g-tabs">
      <Tabs.List>
        <Tabs.Trigger value="week">Week</Tabs.Trigger>
        <Tabs.Trigger value="month">Month</Tabs.Trigger>
        <Tabs.Trigger value="year">Year</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="week">This week: 1,284 plays.</Tabs.Content>
      <Tabs.Content value="month">This month: 5,940 plays.</Tabs.Content>
      <Tabs.Content value="year">This year: 61,200 plays.</Tabs.Content>
    </Tabs.Root>
  );
}

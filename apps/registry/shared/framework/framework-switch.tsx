"use client";

import {
  useFramework,
  type Framework,
} from "@/shared/framework/framework-context";
import {
  SegmentedControl,
  type SegmentedOption,
} from "@/shared/components/segmented-control";

export const FRAMEWORK_OPTIONS: readonly SegmentedOption<Framework>[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
];

export function FrameworkSwitch() {
  const { framework, setFramework } = useFramework();
  return (
    <SegmentedControl
      options={FRAMEWORK_OPTIONS}
      value={framework}
      onChange={setFramework}
    />
  );
}

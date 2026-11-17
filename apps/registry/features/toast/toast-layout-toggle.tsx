"use client";

import {
  useToastLayout,
  type ToastLayout,
} from "@/features/toast/toast-layout-context";
import {
  SegmentedControl,
  type SegmentedOption,
} from "@/shared/components/segmented-control";

export const TOAST_LAYOUT_OPTIONS: readonly SegmentedOption<ToastLayout>[] = [
  { value: "stack", label: "Stack" },
  { value: "list", label: "List" },
];

export function ToastLayoutToggle() {
  const { layout, setLayout } = useToastLayout();
  return (
    <SegmentedControl
      options={TOAST_LAYOUT_OPTIONS}
      value={layout}
      onChange={setLayout}
    />
  );
}

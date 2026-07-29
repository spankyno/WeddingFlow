type StyleOverride = {
  colorBackground?: string;
  colorText?: string;
};

export function SectionStyleWrapper({
  override,
  children,
}: {
  override?: StyleOverride;
  children: React.ReactNode;
}) {
  if (!override || (!override.colorBackground && !override.colorText)) return <>{children}</>;

  return (
    <div style={{ backgroundColor: override.colorBackground, color: override.colorText }}>
      {children}
    </div>
  );
}

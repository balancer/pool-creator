import { usePathname, useRouter } from "next/navigation";
import { ContactSupportModal, PoolStateResetModal } from "~~/components/common";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";

export function SupportAndResetModals({
  callback,
  hideSupport = false,
}: {
  callback?: () => void;
  hideSupport?: boolean;
}) {
  const { clearPoolStore } = usePoolCreationStore();
  const { clearUserData } = useUserDataStore();

  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex justify-center gap-2 items-center">
      {!hideSupport && (
        <>
          <ContactSupportModal />
          <div className="text-xl">·</div>
        </>
      )}
      <PoolStateResetModal
        callback={() => {
          clearPoolStore();
          clearUserData();
          router.push(pathname);
          if (callback) callback();
        }}
      />
    </div>
  );
}

import { useTranslation } from "react-i18next";

type DonorType = "person" | "company";

type DonorIdentityFieldsProps = {
  isAnonymous: boolean;
  onAnonymousChange: (isAnonymous: boolean) => void;
  donorType: DonorType;
  onDonorTypeChange: (donorType: DonorType) => void;
  donorName: string;
  onDonorNameChange: (donorName: string) => void;
};

export function DonorIdentityFields({
  isAnonymous,
  onAnonymousChange,
  donorType,
  onDonorTypeChange,
  donorName,
  onDonorNameChange,
}: DonorIdentityFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="donor-identity">
      <label className="donation-anonymous-toggle" htmlFor="donation-anonymous">
        <input
          id="donation-anonymous"
          type="checkbox"
          checked={isAnonymous}
          onChange={(event) => onAnonymousChange(event.target.checked)}
        />
        <span>{t("payments.anonymousDonation")}</span>
      </label>

      {!isAnonymous && (
        <>
          <div className="donation-type-group" role="group" aria-label={t("payments.donorTypeQuestion")}>
            <span className="donation-type-label">{t("payments.donorTypeQuestion")}</span>
            <div className="donation-type-options">
              <button
                type="button"
                className={donorType === "person" ? "is-selected" : ""}
                aria-pressed={donorType === "person"}
                onClick={() => onDonorTypeChange("person")}
              >
                {t("payments.donorPerson")}
              </button>
              <button
                type="button"
                className={donorType === "company" ? "is-selected" : ""}
                aria-pressed={donorType === "company"}
                onClick={() => onDonorTypeChange("company")}
              >
                {t("payments.donorCompany")}
              </button>
            </div>
          </div>

          <label className="donation-name-field" htmlFor="donor-name">
            {t("payments.nameForLeaderboard")}
          </label>
          <input
            id="donor-name"
            type="text"
            value={donorName}
            onChange={(event) => onDonorNameChange(event.target.value)}
            placeholder={t("payments.namePlaceholder")}
            maxLength={80}
          />
        </>
      )}
    </div>
  );
}

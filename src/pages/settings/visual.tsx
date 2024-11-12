import {
  AppWindowMac,
  Blend,
  Bug,
  Grid,
  Languages,
  ListCollapse,
  Spline,
} from "lucide-react";
import { SettingField } from "./_field";
import { useTranslation } from "react-i18next";
import { languages } from "./_languages";

export default function Visual() {
  const { t } = useTranslation("settingsVisual");

  return (
    <>
      <SettingField
        icon={<Languages />}
        settingKey="language"
        title={t("language")}
        type="select"
        options={languages}
      />
      <SettingField
        icon={<Spline />}
        settingKey="lineStyle"
        title={t("lineStyle")}
        type="select"
        options={[
          { label: t("lineStyles.straight"), value: "straight" },
          { label: t("lineStyles.bezier"), value: "bezier" },
          { label: t("lineStyles.vertical"), value: "vertical" },
        ]}
      />
      <SettingField
        icon={<Grid />}
        settingKey="showGrid"
        title={t("showGrid")}
        type="switch"
      />
      <SettingField
        icon={<Blend />}
        settingKey="windowBackgroundAlpha"
        title={t("windowBackgroundAlpha")}
        type="slider"
        min={0}
        max={1}
        step={0.01}
      />
      <SettingField
        icon={<Bug />}
        settingKey="showDebug"
        title={t("showDebug")}
        type="switch"
      />

      <SettingField
        icon={<ListCollapse />}
        settingKey="alwaysShowDetails"
        title={t("alwaysShowDetails")}
        type="switch"
      />
      <SettingField
        icon={<AppWindowMac />}
        settingKey="useNativeTitleBar"
        title={t("useNativeTitleBar")}
        type="switch"
      />
    </>
  );
}

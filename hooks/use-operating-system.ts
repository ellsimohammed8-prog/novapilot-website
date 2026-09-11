"use client";

import { useState, useEffect } from "react";

export type OperatingSystem = "windows" | "mac" | "linux" | "ios" | "android" | "unknown";

export interface OperatingSystemState {
  os: OperatingSystem;
  isWindows: boolean;
  architecture: string; // "x64" | "arm64"
  isHydrated: boolean;
}

const DEFAULT_SERVER_OS_STATE: OperatingSystemState = {
  os: "windows",
  isWindows: true,
  architecture: "x64",
  isHydrated: false,
};

export function parseOperatingSystem(
  userAgent?: string,
  userAgentData?: { platform?: string; brands?: Array<{ brand: string; version: string }> }
): OperatingSystemState {
  if (!userAgent && !userAgentData) {
    return {
      os: "windows",
      isWindows: true,
      architecture: "x64",
      isHydrated: true,
    };
  }

  const ua = (userAgent || "").toLowerCase();
  const platform = (userAgentData?.platform || "").toLowerCase();

  let os: OperatingSystem = "unknown";
  let isWindows = false;
  let architecture = "x64";

  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    os = "ios";
    isWindows = false;
    architecture = "arm64";
  } else if (platform.includes("android") || ua.includes("android")) {
    os = "android";
    isWindows = false;
  } else if (platform.includes("mac") || ua.includes("mac") || ua.includes("darwin")) {
    os = "mac";
    isWindows = false;
    if (ua.includes("arm64")) {
      architecture = "arm64";
    } else {
      architecture = "x64";
    }
  } else if (platform.includes("win") || ua.includes("win")) {
    os = "windows";
    isWindows = true;
    if (ua.includes("arm64") || platform.includes("arm")) {
      architecture = "arm64";
    } else {
      architecture = "x64";
    }
  } else if (platform.includes("linux") || ua.includes("linux")) {
    os = "linux";
    isWindows = false;
  }

  return {
    os,
    isWindows,
    architecture,
    isHydrated: true,
  };
}

export function useOperatingSystem(): OperatingSystemState {
  const [osState, setOsState] = useState<OperatingSystemState>(DEFAULT_SERVER_OS_STATE);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const nav = window.navigator as unknown as {
        userAgent?: string;
        userAgentData?: {
          platform?: string;
          brands?: Array<{ brand: string; version: string }>;
        };
      };

      const detected = parseOperatingSystem(nav.userAgent, nav.userAgentData);
      setOsState(detected);
    } catch {
      setOsState({
        os: "windows",
        isWindows: true,
        architecture: "x64",
        isHydrated: true,
      });
    }
  }, []);

  return osState;
}

export default useOperatingSystem;

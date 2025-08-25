import { useState, useCallback, useMemo } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';

/**
 * useStoragePermission
 *
 * This hook checks and requests storage-related permissions on Android.
 * It returns whether the permission is granted and a function to request it.
 *
 * On iOS, this hook always returns granted, since storage permissions are not required.
 *
 * Usage:
 * const { hasPermission, requestPermission } = useStoragePermission();
 * if (!hasPermission) { ... }
 */
export const useStoragePermission = () => {
  // State to track if permission is granted
  const [hasStoragePermission, setHasStoragePermission] = useState<boolean>(
    Platform.OS !== 'android',
  );

  // List of permissions to check/request on Android
  const STORAGE_PERMISSIONS = useMemo(
    () => [
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ],
    [],
  );

  // Function to check if all required permissions are granted
  const checkPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setHasStoragePermission(true);
      return true;
    }
    try {
      const results = await Promise.all(
        STORAGE_PERMISSIONS.map(perm => PermissionsAndroid.check(perm)),
      );
      console.log(results);
      const allGranted = results.every(Boolean);
      setHasStoragePermission(allGranted);
      return allGranted;
    } catch (e) {
      setHasStoragePermission(false);
      return false;
    }
  }, [STORAGE_PERMISSIONS]);

  // Function to request all required permissions
  const requestStoragePermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return true;
    }
    try {
      const results =
        await PermissionsAndroid.requestMultiple(STORAGE_PERMISSIONS);
      const allGranted = Object.values(results).every(
        status => status === PermissionsAndroid.RESULTS.GRANTED,
      );
      setHasStoragePermission(allGranted);
      return allGranted;
    } catch (e) {
      setHasStoragePermission(false);
      return false;
    }
  }, [STORAGE_PERMISSIONS]);

  checkPermission();
  return {
    hasStoragePermission,
    requestStoragePermission,
  };
}
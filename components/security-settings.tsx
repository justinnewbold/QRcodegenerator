'use client';

import { useState, useEffect } from 'react';
import {
  setPasswordProtection,
  getPasswordProtection,
  removePasswordProtection,
  changePassword,
  isPasswordProtected,
  setGeolocationRestriction,
  getGeolocationRestriction,
  removeGeolocationRestriction,
  addAllowedLocation,
  removeAllowedLocation,
  getCurrentLocation,
  PasswordProtection,
  GeolocationRestriction,
  GeoLocation,
} from '@/lib/qr-security';
import {
  Shield,
  X,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Loader2,
  Navigation,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface SecuritySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  qrId?: string;
  onSave?: () => void;
}

export function SecuritySettings({
  isOpen,
  onClose,
  qrId,
  onSave,
}: SecuritySettingsProps) {
  const [activeTab, setActiveTab] = useState<'password' | 'location'>('password');

  // Password state
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hint, setHint] = useState('');
  const [maxAttempts, setMaxAttempts] = useState<number | undefined>(5);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordConfig, setPasswordConfig] = useState<PasswordProtection | null>(null);

  // Location state
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locations, setLocations] = useState<GeoLocation[]>([]);
  const [radiusMeters, setRadiusMeters] = useState(100);
  const [outsideMessage, setOutsideMessage] = useState('');
  const [locationConfig, setLocationConfig] = useState<GeolocationRestriction | null>(null);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationLat, setNewLocationLat] = useState('');
  const [newLocationLng, setNewLocationLng] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Error states
  const [passwordError, setPasswordError] = useState('');
  const [locationError, setLocationError] = useState('');

  // Load config when qrId changes
  useEffect(() => {
    if (isOpen && qrId) {
      // Load password config
      const pwConfig = getPasswordProtection(qrId);
      setPasswordConfig(pwConfig);
      setPasswordEnabled(pwConfig?.enabled ?? false);
      setHint(pwConfig?.hint ?? '');
      setMaxAttempts(pwConfig?.maxAttempts ?? 5);
      setPassword('');
      setConfirmPassword('');

      // Load location config
      const geoConfig = getGeolocationRestriction(qrId);
      setLocationConfig(geoConfig);
      setLocationEnabled(geoConfig?.enabled ?? false);
      setLocations(geoConfig?.allowedLocations ?? []);
      setRadiusMeters(geoConfig?.radiusMeters ?? 100);
      setOutsideMessage(geoConfig?.outsideMessage ?? '');
    }
  }, [isOpen, qrId]);

  // Get current location
  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError('');
    try {
      const pos = await getCurrentLocation();
      setNewLocationLat(pos.latitude.toFixed(6));
      setNewLocationLng(pos.longitude.toFixed(6));
    } catch {
      setLocationError('Failed to get location. Please enable location services.');
    }
    setIsLoadingLocation(false);
  };

  // Add new location
  const handleAddLocation = () => {
    if (!newLocationName || !newLocationLat || !newLocationLng) {
      setLocationError('Please fill in all location fields');
      return;
    }

    const lat = parseFloat(newLocationLat);
    const lng = parseFloat(newLocationLng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setLocationError('Invalid coordinates');
      return;
    }

    const newLocation: GeoLocation = {
      id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newLocationName,
      latitude: lat,
      longitude: lng,
    };

    setLocations([...locations, newLocation]);
    setNewLocationName('');
    setNewLocationLat('');
    setNewLocationLng('');
    setLocationError('');
  };

  // Remove location
  const handleRemoveLocation = (id: string) => {
    setLocations(locations.filter(l => l.id !== id));
  };

  // Save password settings (async for secure hashing)
  const handleSavePassword = async () => {
    if (!qrId) return;

    if (!passwordEnabled) {
      removePasswordProtection(qrId);
      setPasswordConfig(null);
      onSave?.();
      return;
    }

    // Validate password
    if (!passwordConfig && !password) {
      setPasswordError('Please enter a password');
      return;
    }

    if (password && password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (password && password.length < 4) {
      setPasswordError('Password must be at least 4 characters');
      return;
    }

    if (password) {
      await setPasswordProtection(qrId, password, {
        hint: hint || undefined,
        maxAttempts: maxAttempts,
      });
    } else if (passwordConfig) {
      // Just update settings without changing password
      await setPasswordProtection(qrId, '', {
        hint: hint || undefined,
        maxAttempts: maxAttempts,
      });
    }

    setPasswordError('');
    setPassword('');
    setConfirmPassword('');
    setPasswordConfig(getPasswordProtection(qrId));
    onSave?.();
  };

  // Save location settings
  const handleSaveLocation = () => {
    if (!qrId) return;

    if (!locationEnabled || locations.length === 0) {
      removeGeolocationRestriction(qrId);
      setLocationConfig(null);
      onSave?.();
      return;
    }

    setGeolocationRestriction(qrId, locations, {
      radiusMeters,
      outsideMessage: outsideMessage || undefined,
    });

    setLocationConfig(getGeolocationRestriction(qrId));
    onSave?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Shield className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Security Settings</h2>
              <p className="text-sm text-muted-foreground">
                Password and location restrictions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'password'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </span>
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'location'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!qrId ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                Select a QR code to configure security settings
              </p>
            </div>
          ) : activeTab === 'password' ? (
            <div className="space-y-6">
              {/* Enable toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Password Protection</h3>
                    <p className="text-sm text-muted-foreground">
                      Require password to view content
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPasswordEnabled(!passwordEnabled)}
                  className="text-primary"
                >
                  {passwordEnabled ? (
                    <ToggleRight className="h-8 w-8" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                  )}
                </button>
              </div>

              {passwordEnabled && (
                <>
                  {/* Current status */}
                  {passwordConfig && (
                    <div className="rounded-lg bg-green-500/10 p-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">Password Protected</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Enter a new password below to change it, or leave blank to keep current.
                      </p>
                    </div>
                  )}

                  {/* Password fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        {passwordConfig ? 'New Password' : 'Password'}
                      </label>
                      <div className="relative mt-1">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={passwordConfig ? 'Enter new password' : 'Enter password'}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Confirm Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Password Hint (optional)</label>
                      <input
                        type="text"
                        value={hint}
                        onChange={(e) => setHint(e.target.value)}
                        placeholder="Hint to help remember"
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Max Attempts Before Lockout</label>
                      <select
                        value={maxAttempts ?? ''}
                        onChange={(e) => setMaxAttempts(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">No limit</option>
                        <option value="3">3 attempts</option>
                        <option value="5">5 attempts</option>
                        <option value="10">10 attempts</option>
                      </select>
                    </div>
                  </div>

                  {passwordError && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      {passwordError}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Enable toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Location Restriction</h3>
                    <p className="text-sm text-muted-foreground">
                      Only allow access from specific locations
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setLocationEnabled(!locationEnabled)}
                  className="text-primary"
                >
                  {locationEnabled ? (
                    <ToggleRight className="h-8 w-8" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                  )}
                </button>
              </div>

              {locationEnabled && (
                <>
                  {/* Allowed locations */}
                  <div>
                    <h4 className="mb-2 font-medium">Allowed Locations</h4>
                    {locations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No locations added yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {locations.map((loc) => (
                          <div
                            key={loc.id}
                            className="flex items-center justify-between rounded-lg border border-border p-3"
                          >
                            <div>
                              <span className="font-medium">{loc.name}</span>
                              <span className="ml-2 text-sm text-muted-foreground">
                                {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveLocation(loc.id)}
                              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add new location */}
                  <div className="rounded-lg border border-border p-4">
                    <h4 className="mb-3 font-medium">Add Location</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newLocationName}
                        onChange={(e) => setNewLocationName(e.target.value)}
                        placeholder="Location name (e.g., Office)"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newLocationLat}
                          onChange={(e) => setNewLocationLat(e.target.value)}
                          placeholder="Latitude"
                          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <input
                          type="text"
                          value={newLocationLng}
                          onChange={(e) => setNewLocationLng(e.target.value)}
                          placeholder="Longitude"
                          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleGetCurrentLocation}
                          disabled={isLoadingLocation}
                          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
                        >
                          {isLoadingLocation ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Navigation className="h-4 w-4" />
                          )}
                          Use Current Location
                        </button>
                        <button
                          onClick={handleAddLocation}
                          className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        Allowed Radius: {radiusMeters}m
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="1000"
                        step="10"
                        value={radiusMeters}
                        onChange={(e) => setRadiusMeters(parseInt(e.target.value))}
                        className="mt-2 w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>10m</span>
                        <span>500m</span>
                        <span>1000m</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Message for Outside Locations (optional)
                      </label>
                      <input
                        type="text"
                        value={outsideMessage}
                        onChange={(e) => setOutsideMessage(e.target.value)}
                        placeholder="This QR code is only valid at specific locations"
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {locationError && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      {locationError}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {qrId && (
          <div className="flex gap-2 border-t border-border p-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (activeTab === 'password') {
                  handleSavePassword();
                } else {
                  handleSaveLocation();
                }
              }}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

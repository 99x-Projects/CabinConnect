import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cabinsApi } from '@/services/cabins';
import { ApiError } from '@/services/api';
import type { KeyInfo } from '@/types/cabin';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

interface FieldState {
  revealed: boolean;
  plaintext: string | null;
  revealError: boolean;
  revealing: boolean;
}

interface Props {
  cabinId: string;
  keyInfo: KeyInfo;
}

const FIELDS = [
  { key: 'accessCodes', label: 'Access Codes' },
  { key: 'emergencyContacts', label: 'Emergency Contacts' },
  { key: 'houseRules', label: 'House Rules' },
] as const;

type FieldKey = (typeof FIELDS)[number]['key'];

function isNonHouseRulesField(key: FieldKey): key is 'accessCodes' | 'emergencyContacts' {
  return key !== 'houseRules';
}

export function KeyInfoPanel({ cabinId, keyInfo }: Props) {
  const queryClient = useQueryClient();

  const [fieldStates, setFieldStates] = useState<Record<FieldKey, FieldState>>({
    accessCodes: { revealed: false, plaintext: null, revealError: false, revealing: false },
    emergencyContacts: { revealed: false, plaintext: null, revealError: false, revealing: false },
    houseRules: { revealed: false, plaintext: null, revealError: false, revealing: false },
  });

  const [editValues, setEditValues] = useState({
    accessCodes: '',
    emergencyContacts: '',
    houseRules: keyInfo.houseRules ?? '',
  });

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<Pick<KeyInfo, 'accessCodes' | 'emergencyContacts' | 'houseRules'>>) =>
      cabinsApi.upsertKeyInfo(cabinId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabin', cabinId] });
      setFieldStates((prev) => ({
        ...prev,
        accessCodes: { ...prev.accessCodes, revealed: false, plaintext: null },
        emergencyContacts: { ...prev.emergencyContacts, revealed: false, plaintext: null },
      }));
    },
  });

  const revealField = async (key: FieldKey) => {
    setFieldStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], revealing: true, revealError: false },
    }));

    try {
      const data = await cabinsApi.getKeyInfo(cabinId, true);
      const value = data[key];
      setFieldStates((prev) => ({
        ...prev,
        [key]: { ...prev[key], revealed: true, plaintext: value, revealing: false },
      }));
    } catch {
      setFieldStates((prev) => ({
        ...prev,
        [key]: { ...prev[key], revealing: false, revealError: true },
      }));
    }
  };

  const hideField = (key: FieldKey) => {
    setFieldStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], revealed: false, plaintext: null, revealError: false },
    }));
  };

  const handleSave = () => {
    const payload: Partial<Pick<KeyInfo, 'accessCodes' | 'emergencyContacts' | 'houseRules'>> = {};
    if (editValues.accessCodes) payload.accessCodes = editValues.accessCodes;
    if (editValues.emergencyContacts) payload.emergencyContacts = editValues.emergencyContacts;
    if (editValues.houseRules) payload.houseRules = editValues.houseRules;
    saveMutation.mutate(payload);
  };

  const isSaving = saveMutation.isPending;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Key Information</h3>

      {FIELDS.map(({ key, label }) => {
        const state = fieldStates[key];
        const masked = keyInfo[key];
        const isMaskedField = isNonHouseRulesField(key);

        return (
          <div key={key} className="space-y-1">
            <Label>{label}</Label>

            {isMaskedField ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono min-h-[40px]">
                  {state.revealError ? (
                    <span className="text-destructive text-xs">Failed to reveal</span>
                  ) : state.revealed ? (
                    state.plaintext ?? <span className="text-muted-foreground italic">Not set</span>
                  ) : (
                    masked ?? <span className="text-muted-foreground italic">Not set</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={state.revealing || isSaving}
                  onClick={() => (state.revealed ? hideField(key) : revealField(key))}
                >
                  {state.revealed ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <div className="rounded-md border bg-muted px-3 py-2 text-sm min-h-[40px] whitespace-pre-wrap">
                {keyInfo.houseRules ?? <span className="text-muted-foreground italic">Not set</span>}
              </div>
            )}
          </div>
        );
      })}

      <div className="border-t pt-6 space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Update Key Info</h4>
        <p className="text-xs text-muted-foreground">Leave a field blank to keep the existing value.</p>

        {(['accessCodes', 'emergencyContacts'] as const).map((key) => {
          const label = key === 'accessCodes' ? 'Access Codes' : 'Emergency Contacts';
          return (
            <div key={key} className="space-y-1">
              <Label htmlFor={`ki-${key}`}>{label}</Label>
              <Textarea
                id={`ki-${key}`}
                rows={2}
                placeholder="Leave blank to keep current value"
                value={editValues[key]}
                onChange={(e) => setEditValues((prev) => ({ ...prev, [key]: e.target.value }))}
                disabled={isSaving}
              />
            </div>
          );
        })}

        <div className="space-y-1">
          <Label htmlFor="ki-houseRules">House Rules</Label>
          <Textarea
            id="ki-houseRules"
            rows={4}
            placeholder="Leave blank to keep current value"
            value={editValues.houseRules}
            onChange={(e) => setEditValues((prev) => ({ ...prev, houseRules: e.target.value }))}
            disabled={isSaving}
          />
        </div>

        {saveMutation.isError && (
          <p className="text-sm text-destructive">
            {saveMutation.error instanceof ApiError ? saveMutation.error.message : 'Failed to save. Please try again.'}
          </p>
        )}

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save Key Info'}
        </Button>
      </div>
    </div>
  );
}

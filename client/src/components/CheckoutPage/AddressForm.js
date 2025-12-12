import React, { useCallback, useEffect, useState } from 'react';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

const EN_TEXTS = {
  firstNameLabel: 'First name',
  firstNamePlaceholder: 'John',
  lastNameLabel: 'Last name',
  lastNamePlaceholder: 'Snow',
  phoneLabel: 'Phone number',
  phonePlaceholder: '(123) 456-7890',
  ttsFirstName: 'Enter your first name',
  ttsLastName: 'Enter your last name',
  ttsPhone: 'Enter your phone number',
};

export default function AddressForm({ firstName, setFirstName, lastName, setLastName, phoneNumber, setPhoneNumber, ttsEnabled, language = 'EN', translate }) {
  const [texts, setTexts] = useState(EN_TEXTS);

  useEffect(() => {
    let cancelled = false;

    const updateTexts = async () => {
      if (!translate || language === 'EN') {
        if (!cancelled) setTexts(EN_TEXTS);
        return;
      }

      const translated = {};
      for (const [key, value] of Object.entries(EN_TEXTS)) {
        translated[key] = await translate(value);
      }
      if (!cancelled) setTexts(translated);
    };

    updateTexts();

    return () => {
      cancelled = true;
    };
  }, [language, translate]);

  const speak = useCallback((text) => {
    if (ttsEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }, [ttsEnabled]);

  return (
    <Grid container spacing={3}>
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="first-name" required>
          {texts.firstNameLabel}
        </FormLabel>
        <OutlinedInput
          id="first-name"
          name="first-name"
          type="name"
          placeholder={texts.firstNamePlaceholder}
          autoComplete="first name"
          required
          size="small"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          onFocus={() => speak(texts.ttsFirstName)}
        />
      </FormGrid>
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="last-name" required>
          {texts.lastNameLabel}
        </FormLabel>
        <OutlinedInput
          id="last-name"
          name="last-name"
          type="last-name"
          placeholder={texts.lastNamePlaceholder}
          autoComplete="last name"
          required
          size="small"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          onFocus={() => speak(texts.ttsLastName)}
        />
      </FormGrid>
      <FormGrid size={{ xs: 12 }}>
        <FormLabel htmlFor="phone-number">
          {texts.phoneLabel}
        </FormLabel>
        <OutlinedInput
          id="phone-number"
          name="phone-number"
          type="tel"
          placeholder={texts.phonePlaceholder}
          autoComplete="tel"
          size="small"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          onFocus={() => speak(texts.ttsPhone)}
        />
      </FormGrid>
    
    </Grid>
  );
}

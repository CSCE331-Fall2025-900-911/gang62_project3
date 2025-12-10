import { useState } from 'react';

export function useFormState() {
  // Address form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Payment form state
  const [paymentType, setPaymentType] = useState('creditCard');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cardName, setCardName] = useState('');

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phoneNumber,
    setPhoneNumber,
    paymentType,
    setPaymentType,
    cardNumber,
    setCardNumber,
    cvv,
    setCvv,
    expirationDate,
    setExpirationDate,
    cardName,
    setCardName,
  };
}


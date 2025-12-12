import AddressForm from '../AddressForm';
import PaymentForm from '../PaymentForm';
import Review from '../Review';

export function getStepContent(
  step,
  orderItems,
  orderTotal,
  formData,
  extrasState,
  ttsEnabled,
  language,
  translate
) {
  switch (step) {
    case 0:
      return (
        <AddressForm 
          firstName={formData.firstName}
          setFirstName={formData.setFirstName}
          lastName={formData.lastName}
          setLastName={formData.setLastName}
          phoneNumber={formData.phoneNumber}
          setPhoneNumber={formData.setPhoneNumber}
          ttsEnabled={ttsEnabled}
          language={language}
          translate={translate}
        />
      );
    case 1:
      return (
        <PaymentForm 
          paymentType={formData.paymentType}
          setPaymentType={formData.setPaymentType}
          cardNumber={formData.cardNumber}
          setCardNumber={formData.setCardNumber}
          cvv={formData.cvv}
          setCvv={formData.setCvv}
          expirationDate={formData.expirationDate}
          setExpirationDate={formData.setExpirationDate}
          cardName={formData.cardName}
          setCardName={formData.setCardName}
          ttsEnabled={ttsEnabled}
          language={language}
          translate={translate}
        />
      );
    case 2:
      return (
        <Review 
          orderItems={orderItems} 
          orderTotal={orderTotal}
          firstName={formData.firstName}
          lastName={formData.lastName}
          phoneNumber={formData.phoneNumber}
          paymentType={formData.paymentType}
          cardNumber={formData.cardNumber}
          cardName={formData.cardName}
          expirationDate={formData.expirationDate}
          extras={extrasState.extras}
          setExtras={extrasState.setExtras}
          ttsEnabled={ttsEnabled}
          language={language}
          translate={translate}
        />
      );
    default:
      throw new Error('Unknown step');
  }
}


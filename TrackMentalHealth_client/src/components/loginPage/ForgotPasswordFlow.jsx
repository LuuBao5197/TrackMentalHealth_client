import React, { useState } from 'react';
import ForgotPasswordForm from './ForgotPasswordForm';
import VerifyOtpForm from './VerifyOtpForm';
import ResetPasswordForm from './ResetPasswordForm';

const ForgotPasswordFlow = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');

    return (
        <>
            {step === 1 && <ForgotPasswordForm onOtpSent={(email) => { setEmail(email); setStep(2); }} />}
            {step === 2 && <VerifyOtpForm email={email} onVerified={() => setStep(3)} />}
            {step === 3 && <ResetPasswordForm email={email} />}
        </>
    );
};

export default ForgotPasswordFlow;

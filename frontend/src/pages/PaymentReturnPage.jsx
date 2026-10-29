import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function PaymentReturnPage() {
  const [params] = useSearchParams();
  
  // Unified status state layout configuration
  const [state, setState] = useState({
    loading: true,
    message: 'Verifying your payment…',
    paid: false,
  });

  // Verify checkout reference handshake on mount
  useEffect(() => {
    const reference = params.get('reference') || params.get('trxref');

    // Guard Clause: Block request if no webhook payload query parameter exists
    if (!reference) {
      setState({
        loading: false,
        message: 'No payment reference was provided.',
        paid: false,
      });
      return;
    }

    // Call backend engine to check provider authorization state via Paystack
    api(`/payments/paystack/verify/${encodeURIComponent(reference)}`)
      .then((d) => {
        const isPaid = d.payment_status === 'paid';
        
        setState({
          loading: false,
          paid: isPaid,
          message: isPaid
            ? 'Payment confirmed. Your order is being processed.'
            : `Payment status: ${d.payment_status}.`,
        });
      })
      .catch((e) => {
        setState({
          loading: false,
          paid: false,
          message: e.message,
        });
      });
  }, [params]);

  return (
    <main className="page-shell empty-state payment-result">
      
      {/* Icon Layout Layer */}
      {state.paid ? (
        <CheckCircle2 size={48} />
      ) : (
        !state.loading && <AlertCircle size={48} />
      )}

      {/* Dynamic Status Header */}
      <h1>
        {state.loading
          ? 'Verifying payment'
          : state.paid
          ? 'Payment successful'
          : 'Payment not confirmed'}
      </h1>

      {/* Explicit Response Copy Description */}
      <p>{state.message}</p>

      {/* Navigation Return Button */}
      <Link className="button primary" to="/account">
        View my orders
      </Link>

    </main>
  );
}

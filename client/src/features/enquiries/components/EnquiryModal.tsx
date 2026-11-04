import { JSX, useState, type ChangeEvent, type FormEvent } from 'react';
import type { Product } from '../../../types/catalog';
import { submitEnquiry } from '../api/enquiriesApi';

type EnquiryFormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof EnquiryFormState, string>>;

type EnquiryModalProps = {
  product: Product;
  onClose: () => void;
};

const initialFormState: EnquiryFormState = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  message: '',
};

function validateForm(formState: EnquiryFormState): FieldErrors {
  const errors: FieldErrors = {};

  if (!formState.customerName.trim()) {
    errors.customerName = 'Full name is required.';
  } else if (formState.customerName.trim().length < 2) {
    errors.customerName = 'Full name must be at least 2 characters long.';
  }

  if (!formState.customerEmail.trim()) {
    errors.customerEmail = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.customerEmail.trim())) {
    errors.customerEmail = 'Enter a valid email address.';
  }

  if (formState.customerPhone.trim() && !/^[+]?[(\d\s-)]{7,20}$/.test(formState.customerPhone.trim())) {
    errors.customerPhone = 'Phone number must contain 7 to 20 digits and valid separators.';
  }

  if (!formState.message.trim()) {
    errors.message = 'Message is required.';
  } else if (formState.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters long.';
  }

  return errors;
}

export function EnquiryModal({ product, onClose }: EnquiryModalProps): JSX.Element {
  const [formState, setFormState] = useState<EnquiryFormState>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target;
    const fieldName = name as keyof EnquiryFormState;

    setFormState((currentState) => ({ ...currentState, [fieldName]: value }));

    if (fieldErrors[fieldName]) {
      setFieldErrors((currentErrors) => ({ ...currentErrors, [fieldName]: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError('');

    const validationErrors = validateForm(formState);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await submitEnquiry({
        productId: product.id,
        productTitle: product.title,
        customerName: formState.customerName,
        customerEmail: formState.customerEmail,
        customerPhone: formState.customerPhone,
        message: formState.message,
      });

      setSuccessMessage(response.message || 'Thank you! Your enquiry has been sent successfully.');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to send your enquiry.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Product enquiry</p>
            <h2>{product.title}</h2>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close enquiry form">
            ×
          </button>
        </div>

        {successMessage ? (
          <div className="success-box">
            <p>{successMessage}</p>
            <button type="button" className="primary-btn" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
            <label>
              Full name
              <input
                type="text"
                name="customerName"
                value={formState.customerName}
                onChange={handleFieldChange}
                placeholder="Jane Doe"
                aria-invalid={Boolean(fieldErrors.customerName)}
              />
              {fieldErrors.customerName && <span className="field-error">{fieldErrors.customerName}</span>}
            </label>

            <label>
              Email
              <input
                type="email"
                name="customerEmail"
                value={formState.customerEmail}
                onChange={handleFieldChange}
                placeholder="jane@example.com"
                aria-invalid={Boolean(fieldErrors.customerEmail)}
              />
              {fieldErrors.customerEmail && <span className="field-error">{fieldErrors.customerEmail}</span>}
            </label>

            <label>
              Phone number
              <input
                type="tel"
                name="customerPhone"
                value={formState.customerPhone}
                onChange={handleFieldChange}
                placeholder="+1 555 123 4567"
                aria-invalid={Boolean(fieldErrors.customerPhone)}
              />
              {fieldErrors.customerPhone && <span className="field-error">{fieldErrors.customerPhone}</span>}
            </label>

            <label>
              Message
              <textarea
                name="message"
                value={formState.message}
                onChange={handleFieldChange}
                rows={4}
                placeholder="I would like more information about this product."
                aria-invalid={Boolean(fieldErrors.message)}
              />
              {fieldErrors.message && <span className="field-error">{fieldErrors.message}</span>}
            </label>

            {error && <p className="error-text">{error}</p>}

            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="primary-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send enquiry'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

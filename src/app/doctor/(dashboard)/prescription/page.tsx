import { redirect } from 'next/navigation';

// /doctor/prescription has no standalone meaning — redirect to patients list
export default function PrescriptionRedirectPage() {
  redirect('/doctor/patients');
}

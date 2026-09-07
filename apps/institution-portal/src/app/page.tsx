import { redirect } from 'next/navigation';

/** The workspace root is the dashboard; the guard there handles signed-out. */
export default function IndexPage() {
  redirect('/dashboard');
}

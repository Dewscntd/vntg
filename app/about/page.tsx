import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'אודות Peakees | חוויית קנייה מקומית ומקיימת',
  description:
    'גלו את החזון של Peakees – חנות יד שנייה ישראלית עם שירות אישי, תשלומים מאובטחים וחוויית קנייה קהילתית.',
  keywords: 'Peakees, אודות, יד שנייה, חנות אונליין, קהילה',
  openGraph: {
    title: 'אודות Peakees - בית לחוויית יד שנייה',
    description: 'Peakees מחברת בין משפחות דרך פריטים איכותיים, שירות חם ותמיכה בקיימות.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8 text-right">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowRight className="ml-2 h-4 w-4" />
              חזרה לדף הבית
            </Button>
          </Link>
          <h1 className="mb-4 text-4xl font-bold">אודות Peakees</h1>
          <p className="text-xl text-muted-foreground">
            בית לפריטי יד שנייה איכותיים וחוויית קנייה ישראלית
          </p>
        </div>

        <article className="prose max-w-none rtl:prose-ul:text-right rtl:prose-p:text-right">
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">הסיפור שלנו</h2>
            <p className="mb-4">
              Peakees נולדה מתוך אהבה לפריטים עם אופי והבנה שצריכה אחראית מתחילה בבית. אנחנו אוצרים בקפידה בגדים, נעליים, ספרים וצעצועים במצב מצוין, כדי שכל משפחה תמצא את מה שמתאים לה.
            </p>
            <p className="mb-4">
              הפלטפורמה שלנו משלבת טכנולוגיה מתקדמת עם שירות אישי בעברית, כך שתוכלו לגלות, לבחור ולהזמין בקלות – ולקבל פריטים איכותיים ישירות עד הבית.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">החזון שלנו</h2>
            <p className="mb-4">
              להנגיש פריטי יד שנייה איכותיים לכל משפחה בישראל, תוך שמירה על שירות חם, תשלום מאובטח ותמיכה בקהילה ובסביבה.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">למה לבחור ב-Peakees?</h2>
            <ul className="mb-4 list-inside list-disc space-y-2" role="list">
              <li>אוצרות ידנית ומוקפדת של כל פריט</li>
              <li>תשלום מאובטח במגוון אפשרויות ישראליות</li>
              <li>משלוח מהיר לכל הארץ</li>
              <li>שירות לקוחות אישי וזמין</li>
              <li>מדיניות החזרות נוחה וברורה</li>
              <li>חוויית שימוש מותאמת לנייד ולמשפחות</li>
              <li>תמיכה בצריכה אחראית ובקהילה המקומית</li>
              <li>ליווי מקצועי גם אחרי הרכישה</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">נשמח לשמור על קשר</h2>
            <p className="mb-4">יש לכם שאלות? הצוות של Peakees כאן בשבילכם.</p>
            <Link href="/contact">
              <Button>צרו קשר</Button>
            </Link>
          </section>
        </article>
      </div>
    </main>
  );
}

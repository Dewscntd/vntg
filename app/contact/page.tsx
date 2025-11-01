import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'צור קשר | Peakees - אנחנו כאן בשבילכם',
  description:
    'צרו קשר עם Peakees לקבלת תמיכה, שאלות או שיתופי פעולה. זמינים במייל, בטלפון ובכתובת מרכז הלוגיסטיקה שלנו.',
  keywords: 'Peakees, צור קשר, שירות לקוחות, תמיכה, יד שנייה',
  openGraph: {
    title: 'צור קשר עם Peakees',
    description: 'הצוות שלנו זמין לעזור בכל שאלה על הזמנות, משלוחים ותרומות.',
    type: 'website',
  },
};

export default function ContactPage() {
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
          <h1 className="mb-4 text-4xl font-bold">צור קשר</h1>
          <p className="text-xl text-muted-foreground">
            נשמח לסייע בכל שאלה – הצוות של Peakees כאן בשבילכם.
          </p>
        </div>

        <section
          className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2"
          aria-label="Contact methods"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="ml-2 h-5 w-5" />
                תמיכה במייל
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-muted-foreground">
                לשאלות כלליות ותמיכה בהזמנות
              </p>
              <a
                href="mailto:hello@peakees.co.il"
                className="font-medium text-primary hover:underline"
              >
                hello@peakees.co.il
              </a>
              <p className="mt-2 text-sm text-muted-foreground">
                נענה בדרך כלל בתוך יום עסקים אחד
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="ml-2 h-5 w-5" />
                תמיכה טלפונית
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-muted-foreground">דברו ישירות עם צוות השירות</p>
              <a href="tel:+97235551234" className="font-medium text-primary hover:underline">
                03-555-1234
              </a>
              <p className="mt-2 text-sm text-muted-foreground">ימים א׳-ה׳: 09:00-18:00</p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="ml-2 h-5 w-5" />
                כתובת מרכז הלוגיסטיקה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">Peakees</p>
                <p>החרש 12</p>
                <p>פארק העסקים עמק שרה</p>
                <p>באר שבע</p>
                <p>ישראל</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>שאלות נפוצות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" role="region" aria-label="שאלות נפוצות">
              <div>
                <h4 className="mb-2 font-semibold">איך עוקבים אחרי הזמנה?</h4>
                <p className="text-muted-foreground">
                  ניתן לעקוב אחרי ההזמנה בעמוד המעקב או דרך המייל שבו קיבלתם את מספר המשלוח לאחר היציאה מהמחסן.
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">מה מדיניות ההחזרות?</h4>
                <p className="text-muted-foreground">
                  אנו מציעים 30 ימי החזרה לרוב הפריטים. יש לוודא שהפריט חוזר במצבו המקורי יחד עם האריזה והתגיות.
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">האם ניתן לשלוח לחו״ל?</h4>
                <p className="text-muted-foreground">
                  כרגע אנחנו שולחים ברחבי ישראל. משלוחים לחו״ל נמצאים בבחינה ויפורסמו בהמשך.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

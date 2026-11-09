import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Search,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Button from '../components/ui/Button';
import usePageMeta from '../hooks/usePageMeta';

const demoMenuUrl = () => new URL('/demo-menu', window.location.origin).toString();

const faqGroups = [
  {
    title: 'Before your first order',
    questions: [
      ['What do I need ready before I create an account?', 'Your restaurant name, a phone number and an email address. Add your first dishes after the account exists, and you can publish a menu the same afternoon you start. There is nothing to install on the tablets or phones already behind your counter.'],
      ['Do I need special hardware or a receipt printer?', 'No. Guests use the camera on their own phone, and your team works from a browser on whatever device is already at the pass. Table codes are shown on screen so you can print them on the office printer, have them printed locally, or keep a copy on a phone until the plastic stand arrives.'],
      ['Can I set up one restaurant and add another later?', 'Each restaurant has its own account, menu, tables and order queue. If you run two locations, keep them on separate accounts so the order queues never mix and each team only sees its own tables.'],
    ],
  },
  {
    title: 'Menu and prices',
    questions: [
      ['How do I change a price during service?', 'Open the Menu page in your portal, edit the dish and save. The new price applies to the next order a guest places; orders already sent keep the price they were sent at. No reprint, no announcement to the floor.'],
      ['What is the fastest way to handle a sold-out dish?', 'Mark it unavailable from the same dish row. It disappears from the guest menu on the next load while staying in your portal with its photo and price, so bringing it back tomorrow is a single toggle rather than a re-entry.'],
      ['Can I organise a long menu into sections?', 'Yes. Group dishes into categories such as Breakfast, Main Dishes, Sides and Drinks. Guests move between categories with a row of chips at the top of the menu, so a fifty-dish menu still only shows one section at a time.'],
      ['Do dishes need photos?', 'No, but dishes with a photo read faster on a phone. Use one clear shot per dish and keep the description to a line or two: what it is, how it is cooked, anything a guest would ask a server.'],
    ],
  },
  {
    title: 'Tables and codes',
    questions: [
      ['How does an order know which table it came from?', 'Each table has its own code, and the code is tied to that table in your account. When a guest scans table 04, the order reaches your queue already labelled table 04, so nobody has to write it down or guess.'],
      ['What happens if a table code gets damaged?', 'Open the table and display the code again. The code does not change, so a replacement print or a screenshot works immediately without affecting anything else on that table.'],
      ['Can two guests at the same table order separately?', 'Yes. Two phones at table 04 produce two orders, both tagged table 04, both in the same queue. If they are eating together, staff can serve them together.'],
      ['What if a guest cannot scan?', 'Nothing breaks. Staff can take the order the usual way and enter it at the pass. The table code is a shortcut, not a requirement for service.'],
    ],
  },
  {
    title: 'Guest ordering',
    questions: [
      ['Do guests need an app or an account?', 'No. The code opens your menu in the phone browser. Guests read, choose, add a note for the kitchen and send the order without downloading anything or creating a login.'],
      ['Can a guest leave a note for the kitchen?', 'Yes, there is a note field on the order before it is sent. It arrives with the order rather than in a separate message, so the person preparing the dish sees it at the moment it matters.'],
      ['What does the guest see after ordering?', 'An order number, the table and the current status: sent, in the kitchen, served. It is the same information your team is working from, which removes most of the "where is our food" questions on a full night.'],
      ['Does the guest menu look like my restaurant?', 'It carries your restaurant name, description, location and branding from your profile. Keep those details current before codes go on the tables. It is the first thing a guest checks to be sure they are in the right place.'],
    ],
  },
  {
    title: 'Service and orders',
    questions: [
      ['How does the queue work at the pass?', 'Orders arrive in a New column with the table and the full dish list. Accepting an order moves it to Preparing; finishing it moves it to Ready. The three columns are visible at once, so nobody has to ask what is next.'],
      ['Can I see what was ordered an hour ago?', 'Yes. Completed orders stay in your history with their dishes, table and total, which is useful when a guest asks about a bill or when you want to know how a dish sold.'],
      ['Who can change an order?', 'Your team, from the portal, while it is still with the kitchen. Availability and menu edits are limited to people signed in to your restaurant, so a guest can never change prices or remove dishes.'],
    ],
  },
  {
    title: 'Accounts and data',
    questions: [
      ['Can I change my restaurant details after signing up?', 'Open your profile and update the name, location, contact details, description and branding. Changes reach the guest menu immediately; codes and tables are unaffected.'],       ['Is the demo menu connected to a real account?', 'No. It uses demo Kigali Grillz data held in your browser, so you can change dishes, tables and orders freely without touching anyone else. It exists to show how the guest menu and the restaurant queue stay in step.'],
      ['Where can I read the terms and privacy policy?', 'Both are linked in the footer of every page. They describe what is stored for a restaurant account and what a guest sees when they order from a table.'],
    ],
  },
];

const faqSlug = (title) => `faq-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

export function FAQPage() {
  usePageMeta({
    title: 'Frequently asked questions',
    description: 'Answers about setting up a KazeMenu restaurant, changing menu prices, printing table QR codes, guest ordering and handling orders during service.',
  });
  const [query, setQuery] = useState('');
  const [openQuestion, setOpenQuestion] = useState(null);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const totalQuestions = faqGroups.reduce((sum, group) => sum + group.questions.length, 0);
  const filteredGroups = useMemo(() => faqGroups
    .map((group) => ({
      ...group,
      questions: group.questions.filter(([question, answer]) => (
        !normalizedQuery || `${question} ${answer} ${group.title}`.toLocaleLowerCase().includes(normalizedQuery)
      )),
    }))
    .filter((group) => group.questions.length), [normalizedQuery]);

  return (
    <>
      <section className="fq-hero">
        <div className="fq-wrap">
          <h1>Questions, answered plainly.</h1>
          <p className="fq-lede">             Setup, price changes, table codes and service. {totalQuestions} answers in {faqGroups.length} topics. If something is still missing, the demo menu shows the whole flow end to end.
          </p>
        </div>
      </section>

      <section className="fq-body">
        <div className="fq-wrap fq-grid">
          <aside className="fq-side">
            <label className="faq-search fq-search">
              <Search size={18} aria-hidden="true" />
              <span className="sr-only">Search frequently asked questions</span>
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setOpenQuestion(null);
                }}
                placeholder="Search questions"
              />
            </label>
            <nav className="fq-index" aria-label="FAQ topics">
              {faqGroups.map((group) => {
                const count = normalizedQuery
                  ? filteredGroups.find((item) => item.title === group.title)?.questions.length || 0
                  : group.questions.length;
                return (
                  <a key={group.title} href={`#${faqSlug(group.title)}`} className={count ? undefined : 'fq-index-muted'}>
                    <span>{group.title}</span>
                    <b>{count}</b>
                  </a>
                );
              })}
            </nav>
            <p className="fq-side-note">
              {normalizedQuery
                ? `${filteredGroups.reduce((sum, group) => sum + group.questions.length, 0)} results for “${query.trim()}”`
                : 'Updated whenever a page in the product changes.'}
            </p>
          </aside>

          <div className="fq-list">
            {filteredGroups.length ? filteredGroups.map((group) => (
              <section key={group.title} id={faqSlug(group.title)} className="fq-group" aria-label={group.title}>
                <div className="fq-group-head">
                  <h2>{group.title}</h2>
                  <span>{group.questions.length} {group.questions.length === 1 ? 'question' : 'questions'}</span>
                </div>
                {group.questions.map(([question, answer]) => {
                  const isOpen = openQuestion === question;
                  const answerId = `faq-${question.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                  return (
                    <article key={question} className={`faq-item fq-item ${isOpen ? 'fq-item-open' : ''}`}>
                      <h3>
                        <button
                          type="button"
                          className="faq-question"
                          aria-expanded={isOpen}
                          aria-controls={answerId}
                          onClick={() => setOpenQuestion(isOpen ? null : question)}
                        >
                          <span>{question}</span>
                          <ChevronDown className={`faq-toggle ${isOpen ? 'faq-toggle-open' : ''}`} aria-hidden="true" />
                        </button>
                      </h3>
                      <div id={answerId} className={`faq-answer ${isOpen ? 'faq-answer-open' : ''}`} aria-hidden={!isOpen}>
                        <p>{answer}</p>
                      </div>
                    </article>
                  );
                })}
              </section>
            )) : (
              <div className="faq-empty fq-empty" role="status">
                <h2 className="font-bold text-black">Nothing matches “{query.trim()}”.</h2>
                <p className="mt-2 text-sm text-muted">Try a shorter word such as “price”, “table” or “app”, or clear the field to read everything.</p>
                <button type="button" className="mt-4 text-sm font-bold text-primary underline underline-offset-4" onClick={() => setQuery('')}>Clear search</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="fq-close">
        <div className="fq-wrap fq-close-inner">
          <div>
            <h2>Still deciding?</h2>             <p>Order a dish in the demo menu and watch where it ends up: the guest page and the restaurant queue on the same screen.</p>
          </div>
          <div className="fq-close-actions">
            <Button as={Link} to="/demo-menu">Open the demo menu</Button>
            <Link to="/register" className="ft-link">Create an account <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}

function DemoLink({ children = 'Explore a demo menu' }) {
  return (
    <Link to="/demo-menu" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-black transition-colors hover:text-primary">
      {children} <ArrowRight size={17} aria-hidden="true" />
    </Link>
  );
}

export function HomePage() {
  usePageMeta({
    description: 'Digital menus, one QR code per table and a live dine-in order queue. Guests browse and order from their phone while your team runs service from one portal.',
  });
  return (
    <>
      <section className="home-hero">
        <div className="home-hero-inner mx-auto max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-20">
          <div className="home-copy">
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-black sm:text-5xl lg:text-6xl">
              A better way to bring your restaurant online.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              Give guests an easy way to browse your menu and order from their table, while your team manages menus, tables and orders in one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 home-hero-actions">
              <Button as={Link} to="/register">Set up your restaurant</Button>
              <Button as={Link} to="/demo-menu" variant="secondary">Explore a demo menu <ArrowUpRight size={17} /></Button>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="/assets/Phone Menu.png"
              alt="Phone menu"
              className="hero-photo"
            />
          </div>
        </div>
      </section>

      <section className="hm-compare">
        <div className="hm-wrap">
          <h2 className="hm-h2">Two versions of the same Friday night.</h2>
          <p className="hm-lede">The food is identical. What changes is where the order goes after the guest has decided.</p>
          <div className="hm-compare-grid">
            <div className="hm-col hm-col-before">
              <h3>Before</h3>
              <ol>
                <li>A dish sells out and three printed menus are now wrong.</li>
                <li>The order is written on a pad and walked to the pass.</li>
                <li>The kitchen asks which table the ticket belongs to.</li>
                <li>A guest has to catch someone’s eye to ask how long.</li>
              </ol>
            </div>
            <div className="hm-col hm-col-after">
              <h3>With KazeMenu</h3>
              <ol>
                <li>The dish is marked unavailable and leaves every table’s menu on the next tap.</li>
                <li>The order is sent from the phone with the table number attached.</li>
                <li>It arrives once, on the pass, with the dishes and the table.</li>
                <li>The guest follows the status themselves, from sent to served.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="hm-setup">
        <div className="hm-wrap">
          <h2 className="hm-h2">Your first week, in order.</h2>
          <p className="hm-lede">There is no migration project here. Most of the work happens once, before your first service on the system.</p>
          <ol className="hm-timeline">
            <li>
              <span>15 minutes</span>
              <h3>Set up the restaurant and the first dishes</h3>
              <p>Name, contact details, categories, prices and photos. Once saved, that menu is what guests see when they scan.</p>
            </li>
            <li>
              <span>10 minutes</span>
              <h3>Create the tables and print the codes</h3>
              <p>Each table gets its own card. Print or download it, put it on the table, and that table can take orders.</p>
            </li>
            <li>
              <span>30 seconds</span>
              <h3>Handle a dish that runs out mid-service</h3>
              <p>Mark it unavailable from the portal. It stops appearing for new orders immediately, and it keeps its place for tomorrow.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="hm-sample">
        <div className="hm-wrap hm-sample-grid">
          <div className="hm-sample-copy">
            <h2 className="hm-h2">A menu you can open right now.</h2>                <p className="hm-lede">Demo menu for Kigali Grillz, table 04. Browse the dishes, add an order and place a demo one.</p>             <Link to="/demo-menu" className="hm-link">Open the demo menu <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
          <ul className="hm-sample-list" aria-label="Sample dishes">
            {[
              ['Chicken Burger', 'Main Dishes', '7,500 RWF'],
              ['Lake Kivu Tilapia', 'Main Dishes', '12,000 RWF'],
              ['Fresh Passion Juice', 'Drinks', '2,000 RWF'],
              ['Chocolate Cake', 'Desserts', '3,500 RWF'],
            ].map(([name, category, price]) => (
              <li key={name}>
                <div>
                  <strong>{name}</strong>
                  <span>{category}</span>
                </div>
                <b>{price}</b>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="hm-facts">
        <div className="hm-wrap">
          <dl>
            <div><dt>Guest app</dt><dd>None needed</dd></div>
            <div><dt>Menu changes</dt><dd>Live on save</dd></div>
            <div><dt>Printed tickets</dt><dd>Replaced</dd></div>
            <div><dt>Tables</dt><dd>Add any time</dd></div>
          </dl>
        </div>
      </section>

      <section className="hm-close">
        <div className="hm-wrap hm-close-inner">
          <h2>Ready when your next service is.</h2>
          <div className="hm-close-actions">
            <Button as={Link} to="/register">Set up your restaurant</Button>
            <Link to="/how-it-works" className="hm-link">See the full flow <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}

const featureBlocks = [
  {
    id: 'sold-out',
    kicker: 'Mid-service',
    title: 'A dish runs out at 20:10.',
    body: 'Mark it unavailable in the portal and it leaves the guest menu on the next tap. Nothing is reprinted, and the dish keeps its place for tomorrow. You only turn availability back on.',
    points: ['One toggle per dish', 'Guest menu updates on the next load', 'Sold-out items keep their price and photo'],
  },
  {
    id: 'table',
    kicker: 'From the table',
    title: 'The order knows which table sent it.',
    body: 'Each table has its own code, so the order arrives with the table number already attached. Your team never has to match a ticket to a seat, and a guest never has to describe where they are sitting.',
    points: ['One code per table', 'Table number travels with every order', 'A damaged card can be reprinted any time'],
  },
  {
    id: 'pass',
    kicker: 'At the pass',
    title: 'One queue, in the order it happened.',
    body: 'New, preparing and ready sit side by side, with the table and the dishes on each card. Accepting an order moves it forward for the kitchen and for the guest at the same time.',
    points: ['New, preparing and ready columns', 'Table and dish list on every card', 'Status changes reach the guest automatically'],
  },
  {
    id: 'status',
    kicker: 'At the table',
    title: 'Guests stop asking how long it will be.',
    body: 'The order page shows the same progress your team is working from. That is one fewer interruption per table on a busy night, without anyone sending an update by hand.',
    points: ['No app or account for guests', 'Progress visible on the guest’s phone', 'Order closes when it is served'],
  },
];

export function FeaturesPage() {
  usePageMeta({
    title: 'Features',
    description: 'See how KazeMenu keeps menus current, routes table orders to the pass, and shows guests the same live status your team is working from.',
  });
  return (
    <>
      <section className="ft-hero">
        <div className="ft-wrap">
          <h1>Everything the floor and the pass actually need.</h1>
          <p className="ft-lede">
            KazeMenu is four pieces of work joined together: a menu your guests can read, a code on each table, an order queue your team can finish, and a status page between them. Nothing else is in the way.
          </p>
          <div className="ft-hero-actions">
            <Button as={Link} to="/register">Set up your restaurant</Button>             <Link to="/demo-menu" className="ft-link">Try the demo menu <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="ft-blocks">
        <div className="ft-wrap">
          {featureBlocks.map((block) => (
            <article key={block.id} className={`ft-block ft-block-${block.id}`}>
              <div className="ft-block-copy">
                <p className="ft-kicker">{block.kicker}</p>
                <h2>{block.title}</h2>
                <p className="ft-body">{block.body}</p>
                <ul className="ft-points">
                  {block.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </div>
              <FeatureMock type={block.id} />
            </article>
          ))}
        </div>
      </section>

      <section className="ft-compare">
        <div className="ft-wrap">
          <h2>What you stop doing.</h2>
          <p className="ft-lede">The same responsibilities exist either way. This is who carries them.</p>
          <div className="ft-table-wrap">
            <table className="ft-table">
              <caption className="sr-only">Paper menus and order pads compared with KazeMenu</caption>
              <thead>
                <tr>
                  <th scope="col">On a busy night</th>
                  <th scope="col">Paper and pads</th>
                  <th scope="col">KazeMenu</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Menu price change', 'Reprint or cross out', 'Saved once, live immediately'],
                  ['Dish sold out', 'Staff mention it table to table', 'Toggle off, gone from every menu'],
                  ['Order reaches the kitchen', 'Written, carried, read aloud', 'Sent with the table attached'],
                  ['Knowing what is next', 'Ask the pass', 'New, preparing and ready in one view'],
                  ['Guest status', 'Ask a server', 'Visible on the guest’s phone'],
                  ['Adding a table', 'New printed menu per seat', 'One new code, printed to fit the table'],
                ].map(([label, before, after]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <td>{before}</td>
                    <td>{after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="ft-close">
        <div className="ft-wrap ft-close-inner">
          <div>
            <h2>See it with real dishes before you decide.</h2>             <p>The demo menu uses a demo restaurant, table 04 and a full ordering flow.</p>
          </div>
          <div className="ft-close-actions">             <Button as={Link} to="/demo-menu">Open the demo menu</Button>
            <Link to="/faq" className="ft-link">Read the FAQs <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureMock({ type }) {
  if (type === 'sold-out') {
    return (
      <div className="ft-mock" aria-hidden="true">
        <div className="ft-mock-head"><span>Menu · Main Dishes</span><span>Edit</span></div>
        <div className="ft-mock-dish">
          <img src="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=200&q=80" alt="" />
          <div><strong>Lake Kivu Tilapia</strong><span>12,000 RWF</span></div>
          <em className="ft-switch"><i />Unavailable</em>
        </div>
        <div className="ft-mock-dish ft-mock-dish-muted">
          <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80" alt="" />
          <div><strong>Chicken Burger</strong><span>7,500 RWF</span></div>
          <em className="ft-switch ft-switch-on"><i />Available</em>
        </div>
        <p className="ft-mock-note">Guests see this menu without the unavailable dish.</p>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="ft-mock" aria-hidden="true">
        <div className="ft-mock-head"><span>New order</span><span>19:44</span></div>
        <div className="ft-ticket">
          <div className="ft-ticket-top"><strong>Table 04</strong><span>2 items</span></div>
          <ul>
            <li><span>1 × Grilled salmon</span><span>8,500</span></li>
            <li><span>1 × Citrus tea</span><span>2,500</span></li>
          </ul>
          <div className="ft-ticket-note">“No chilli on the salmon, please.”</div>
          <div className="ft-ticket-foot"><span>Sent from the guest’s phone</span><b>11,000 RWF</b></div>
        </div>
      </div>
    );
  }

  if (type === 'pass') {
    return (
      <div className="ft-mock" aria-hidden="true">
        <div className="ft-mock-head"><span>Orders</span><span>Live</span></div>
        <div className="ft-board">
          {[['New', '3'], ['Preparing', '2'], ['Ready', '1']].map(([label, count]) => (
            <div key={label} className="ft-board-col">
              <span>{label}<b>{count}</b></span>
              <div className="ft-board-card" />
              <div className="ft-board-card ft-board-card-short" />
            </div>
          ))}
        </div>
        <p className="ft-mock-note">Columns move left to right as the kitchen works.</p>
      </div>
    );
  }

  return (
    <div className="ft-mock" aria-hidden="true">
      <div className="ft-mock-head"><span>Order #KM-2048</span><span>Table 04</span></div>
      <div className="ft-status">
        <div className="ft-status-step ft-status-done"><i /><div><strong>Order sent</strong><span>Received by the restaurant</span></div></div>
        <div className="ft-status-step ft-status-now"><i /><div><strong>In the kitchen</strong><span>Being prepared now</span></div></div>
        <div className="ft-status-step"><i /><div><strong>Served at the table</strong><span>Estimated 12–16 min</span></div></div>
      </div>
    </div>
  );
}

const hiwRoute = [
  { time: '0:00', title: 'Scan', detail: 'The camera opens your menu at table 04.' },
  { time: '0:20', title: 'Order', detail: 'Two dishes, a note for the kitchen, the table attached.' },
  { time: '~2 min', title: 'Prepare', detail: 'The pass accepts it and the guest sees Preparing.' },
  { time: '12–16 min', title: 'Serve', detail: 'Ready, then served. Both screens close together.' },
];

const hiwSteps = [
  {
    number: '01',
    moment: 'Guest sits down',
    title: 'The table code opens the right menu.',
    text: 'No app, no download. The guest points the camera at the card on the table and the menu for that restaurant opens in the browser, with the table already known.',
    note: 'Roughly five seconds from camera to menu.',
    screen: 'scan',
    label: 'QR code scanner',
  },
  {
    number: '02',
    moment: 'Choosing dishes',
    title: 'They order without flagging anyone down.',
    text: 'Dishes are grouped the way a menu reads: starters, mains, drinks. A guest adds what they want, leaves a note for the kitchen and sends the order from their own phone.',
    note: 'Sent orders carry the table number automatically.',
    screen: 'menu',
    label: 'Restaurant menu',
  },
  {
    number: '03',
    moment: 'Kitchen and pass',
    title: 'One ticket lands, in one place.',
    text: 'The order appears in the workspace with its table and its full list of dishes. Your team accepts it, starts preparing it and marks it ready as it leaves the pass.',
    note: 'Nothing to retype, nothing to walk over and ask about.',
    screen: 'summary',
    label: 'Order summary',
  },
  {
    number: '04',
    moment: 'Food on the table',
    title: 'The guest knows where things stand.',
    text: 'Status changes reach the guest while the kitchen works, so nobody needs to ask how long it will be. When the plate is served, the order closes.',
    note: 'Fewer interruptions during a busy service.',
    screen: 'tracking',
    label: 'Order tracking',
  },
];

const serviceLog = [
  ['19:42', 'Table 04 scans the QR code', 'Opened menu for Kigali Grillz'],
  ['19:44', 'Order sent', '2 dishes, note for the kitchen'],
  ['19:45', 'Accepted at the pass', 'Status moves to preparing'],
  ['19:58', 'Marked ready', 'Guest sees the update on their phone'],
];

export function HowItWorksPage() {
  usePageMeta({
    title: 'How it works',
    description: 'From a table QR scan to a served dish: follow one order through the guest menu, the restaurant portal and live order tracking.',
  });
  return (
    <>
      <section className="hiw-hero">
        <div className="hiw-hero-inner">
          <div className="hiw-hero-top">
            <div>
              <h1>From seated to served, in four moves.</h1>
              <p className="hiw-lede">
                One QR code per table is the whole start of it. KazeMenu takes the order from the guest’s phone, puts it in front of your team and sends the progress back to the table.
              </p>
            </div>
            <figure className="hiw-table-card">
              <figcaption>
                <span>Kigali Grillz</span>
                <em>Table</em>
              </figcaption>
              <strong>04</strong>
              <Link to="/demo-menu" className="hiw-table-qr" aria-label="Open the demo menu">
                <QRCodeSVG value={demoMenuUrl()} size={96} level="H" aria-label="Table 04 QR code" />
              </Link>               <p>Scan to open the demo menu</p>
            </figure>
          </div>
          <ol className="hiw-route" aria-label="The same four moves, timed">
            {hiwRoute.map(({ time, title, detail }) => (
              <li key={title}>
                <span className="hiw-route-time">{time}</span>
                <h2>{title}</h2>
                <p>{detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="hiw-sequence" aria-label="The four steps in detail">
        {hiwSteps.map((step) => (
          <article key={step.number} className="hiw-step">
            <div className="hiw-step-rail" aria-hidden="true">
              <span>{step.number}</span>
              <i />
            </div>
            <div className="hiw-step-main">
              <div className="hiw-step-copy">
                <p className="hiw-step-moment">{step.moment}</p>
                <h2>{step.title}</h2>
                <p className="hiw-step-text">{step.text}</p>
                <p className="hiw-step-note">{step.note}</p>
              </div>
              <div className="hiw-step-phone">
                <PhoneFrame label={step.label} screen={step.screen} />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="hiw-log">
        <div className="hiw-log-inner">
          <div className="hiw-log-head">
            <div>
              <h2>Real-Time Order Flow: From Scan to Table.</h2>
              <p>See how an order moves instantly from a guest's screen to the kitchen line.</p>
            </div>
            <p className="hiw-log-foot">Instant digital routing that cuts out paper receipts and floor chatter.</p>
          </div>
          <ol className="hiw-log-list">
            {serviceLog.map(([time, title, detail]) => (
              <li key={time}>
                <time>{time}</time>
                <div>
                  <strong>{title}</strong>
                  <span>{detail}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="hiw-closing">
        <div className="hiw-closing-inner">
          <div>
            <h2>Set it up once, then add tables as you open them.</h2>
          </div>
          <div className="hiw-closing-actions">
            <Button as={Link} to="/register">Create a restaurant account</Button>             <DemoLink>Order from the demo menu</DemoLink>
          </div>
        </div>
      </section>
    </>
  );
}

function PhoneFrame({ label, screen }) { return <div className="how-phone w-full max-w-[280px]" aria-label={label}><div className="how-phone-speaker" /><div className={`how-phone-screen how-phone-screen-${screen}`}>{screen === 'scan' && <ScanScreen />}{screen === 'menu' && <MenuScreen />}{screen === 'summary' && <SummaryScreen />}{screen === 'tracking' && <TrackingScreen />}</div></div>; }
function ScanScreen() { return <><div className="phone-topline"><span>9:41</span><span className="phone-status-icons" aria-hidden="true"><i className="phone-signal" /><i className="phone-wifi" /><i className="phone-battery" /></span></div><div className="scanner-title"><span>‹</span><strong>Scan table code</strong><i /></div><p className="scanner-helper">Point your camera at the QR code on your table</p><div className="scanner-viewfinder"><span className="scan-corner scan-corner-tl" /><span className="scan-corner scan-corner-tr" /><span className="scan-corner scan-corner-bl" /><span className="scan-corner scan-corner-br" /><span className="scan-line" /><div className="qr-table-stand"><QRCodeSVG value={demoMenuUrl()} size={54} level="H" includeMargin={false} aria-label="Table 04 QR code" /><small>TABLE 04</small></div></div><div className="scanner-bottom"><span className="scanner-flash">☼</span><p>Scanning securely</p><button type="button">Scan Table Code</button></div></>; }
function MenuScreen() { return <><div className="phone-topline"><span>9:41</span><span className="phone-status-icons" aria-hidden="true"><i className="phone-signal" /><i className="phone-wifi" /><i className="phone-battery" /></span></div><div className="menu-header"><div><small>Welcome to</small><strong>Kaze Bistro</strong></div><b>Table 04</b></div><div className="menu-categories"><span className="active">Popular</span><span>Meals</span><span>Drinks</span></div><div className="menu-grid"><MiniDish name="Smash burger" price="8,500 RWF" image="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=85" quantity="1" /><MiniDish name="Loaded fries" price="5,500 RWF" image="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=85" /><MiniDish name="Truffle fries" price="4,500 RWF" image="https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=400&q=85" /><MiniDish name="House cola" price="2,500 RWF" image="https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=400&q=85" /></div><div className="menu-cart">1 item <b>View order · 8,500 RWF</b></div></>; }
function MiniDish({ name, price, image, quantity }) { return <div className="mini-dish"><img src={image} alt="" /><strong>{name}</strong><div><span>{price}</span>{quantity ? <b className="quantity-control">− {quantity} +</b> : <b className="mini-add">+</b>}</div></div>; }
function SummaryScreen() { return <><div className="phone-topline"><span>9:41</span><span className="phone-status-icons" aria-hidden="true"><i className="phone-signal" /><i className="phone-wifi" /><i className="phone-battery" /></span></div><div className="summary-head"><span>‹</span><strong>Order Summary</strong><i /></div><p className="summary-table">Table 04 <span>2 items</span></p><SummaryItem name="Grilled salmon" price="8,500 RWF" image="https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=240&q=80" /><SummaryItem name="Citrus tea" price="2,500 RWF" image="https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=240&q=80" /><div className="order-note">Add a note <span>＋</span></div><div className="summary-totals"><strong>Total <b>11,000 RWF</b></strong></div><button type="button" className="summary-button">Confirm order <span>→</span></button></>; }
function SummaryItem({ name, price, image }) { return <div className="summary-item"><img src={image} alt="" /><div><strong>{name}</strong><small>1 × {price}</small><b>{price}</b></div></div>; }
function TrackingScreen() { return <><div className="phone-topline"><span>9:41</span><span className="phone-status-icons" aria-hidden="true"><i className="phone-signal" /><i className="phone-wifi" /><i className="phone-battery" /></span></div><div className="tracking-head"><span>‹</span><strong>Track order</strong><i /></div><p className="tracking-order">Order <b>#KM-2048</b></p><div className="preparing-chip"><span /> Preparing</div><div className="tracking-eta"><small>Estimated time</small><strong>12–16 min</strong><span>Table 04</span></div><div className="tracking-timeline"><TimelineItem type="complete" title="Order sent to kitchen" text="Your order has been received" /><TimelineItem type="current" title="In kitchen prep" text="Our chefs are preparing your food" /><TimelineItem type="pending" title="Served at table" text="Your meal will arrive soon" /></div><div className="tracking-help">Need help? <b>Call staff</b></div></>; }
function TimelineItem({ type, title, text }) { return <div className={`timeline-item ${type}`}><span className="timeline-node">{type === 'complete' ? '✓' : ''}</span><div><strong>{title}</strong><small>{text}</small></div></div>; }

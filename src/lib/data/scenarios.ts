import type { Scenario } from "../types";

/**
 * Scenario = system-prompt situation + goal phrases (LEARN step) + task
 * checklist. Goal phrases are described in English;
 * the model renders them in the target language and level.
 */
export const SCENARIOS: Scenario[] = [
  {
    id: "cafe-order",
    category: "daily",
    title: "Order at a café",
    description: "Get a drink and a snack, ask about options, handle the payment.",
    situation:
      "You are a friendly barista at a busy neighborhood café. The learner is a customer. Greet them, take their order, ask clarifying questions (size, milk, to go), mention one special, and close the payment naturally.",
    goalPhrases: ["I'd like ... please", "What do you recommend?", "For here / to go", "How much is it?"],
    tasks: ["Order a drink", "Ask a question about the menu", "Pay and say goodbye"],
    minutes: 5,
    levelHint: "A1",
  },
  {
    id: "directions",
    category: "travel",
    title: "Ask for directions",
    description: "You're lost. Find your way to the station with a stranger's help.",
    situation:
      "You are a helpful local on the street. The learner is lost and looking for the train station. Give directions with landmarks, check understanding, and offer one alternative route.",
    goalPhrases: ["Excuse me, where is ...?", "Is it far from here?", "Left / right / straight", "Could you repeat that?"],
    tasks: ["Ask where the station is", "Confirm one direction you heard", "Thank them and end politely"],
    minutes: 5,
    levelHint: "A1",
  },
  {
    id: "job-interview",
    category: "work",
    title: "Job interview",
    description: "Present yourself, your experience, and one strength convincingly.",
    situation:
      "You are a hiring manager interviewing the learner for a role in their field. Ask about background, one concrete project, a strength and a weakness, and why they want the job. Push politely for detail.",
    goalPhrases: ["I have experience in ...", "My main strength is ...", "In my last role I ...", "I'm motivated by ..."],
    tasks: ["Introduce your background", "Describe one project in detail", "Ask the interviewer a question"],
    minutes: 8,
    levelHint: "B1",
  },
  {
    id: "introduce-yourself",
    category: "daily",
    title: "Meet someone new",
    description: "Introduce yourself at a gathering and keep the small talk going.",
    situation:
      "You are a friendly guest at a mutual friend's dinner. Introduce yourself to the learner, ask about their work, hobbies and where they're from, and share your own answers naturally.",
    goalPhrases: ["Nice to meet you", "What do you do?", "I'm from ...", "How do you know ...?"],
    tasks: ["Introduce yourself", "Ask two questions back", "Find one thing in common"],
    minutes: 5,
    levelHint: "A1",
  },
  {
    id: "doctor-visit",
    category: "daily",
    title: "At the doctor",
    description: "Describe symptoms, understand the advice, ask about medication.",
    situation:
      "You are a calm, clear family doctor. The learner is a patient with a cold or minor pain. Ask about symptoms and duration, give simple advice, prescribe something, and check they understood.",
    goalPhrases: ["It hurts here", "Since two days ago", "Do I need a prescription?", "How often should I take it?"],
    tasks: ["Describe your symptom", "Answer the doctor's questions", "Ask one question about the treatment"],
    minutes: 6,
    levelHint: "A2",
  },
  {
    id: "phone-reservation",
    category: "daily",
    title: "Book a table by phone",
    description: "Call a restaurant, get a table despite a complication.",
    situation:
      "You are a restaurant host answering the phone. The learner wants a table. The requested time is full; offer alternatives, ask for name and party size, and confirm the final booking clearly.",
    goalPhrases: ["I'd like to book a table", "For two people at eight", "Is there anything earlier?", "Under the name ..."],
    tasks: ["State day, time and party size", "Handle the full-slot complication", "Confirm the final reservation"],
    minutes: 5,
    levelHint: "A2",
  },
  {
    id: "hotel-checkin",
    category: "travel",
    title: "Hotel check-in problem",
    description: "Your booking is missing. Stay polite, solve it.",
    situation:
      "You are a hotel receptionist. The learner has a reservation but you cannot find it at first. Ask for details, discover it was misspelled, apologize and upgrade them. Keep it warm but realistic.",
    goalPhrases: ["I have a reservation", "Could you check again?", "Here's my confirmation", "Which floor is it on?"],
    tasks: ["Explain your booking", "Spell your name", "Ask one question about the hotel"],
    minutes: 6,
    levelHint: "A2",
  },
  {
    id: "market-bargain",
    category: "travel",
    title: "Bargain at a market",
    description: "Haggle for a souvenir without losing your smile.",
    situation:
      "You are a charismatic market vendor selling crafts. The learner wants to buy a souvenir. Start high, banter, resist a little, and settle at a fair price. Teach them one local bargaining phrase mid-talk.",
    goalPhrases: ["How much is this?", "That's too expensive", "Can you do ...?", "I'll take it"],
    tasks: ["Ask the price", "Make a counter-offer", "Close the deal"],
    minutes: 5,
    levelHint: "A2",
  },
  {
    id: "small-talk-weekend",
    category: "daily",
    title: "Weekend small talk",
    description: "Chat about your weekend plans with a colleague.",
    situation:
      "You are a friendly colleague at the coffee machine on Friday. Ask about the learner's weekend plans, react with interest, share your own plans, and wrap up naturally when the break ends.",
    goalPhrases: ["Any plans for the weekend?", "I'm planning to ...", "That sounds fun", "Have a good one"],
    tasks: ["Describe a real weekend plan", "Ask about their plans", "React to something they said"],
    minutes: 4,
    levelHint: "A1",
  },
  {
    id: "work-standup",
    category: "work",
    title: "Daily stand-up",
    description: "Report yesterday, today, and one blocker to your team.",
    situation:
      "You are a supportive team lead running a short stand-up. Ask the learner what they did yesterday, what they'll do today, and whether anything blocks them. Ask one follow-up question about the blocker.",
    goalPhrases: ["Yesterday I worked on ...", "Today I'm going to ...", "I'm blocked by ...", "I'll follow up after"],
    tasks: ["Report yesterday's work", "State today's plan", "Explain one blocker"],
    minutes: 4,
    levelHint: "B1",
  },
  {
    id: "apartment-viewing",
    category: "daily",
    title: "Apartment viewing",
    description: "Ask the right questions before renting.",
    situation:
      "You are a real-estate agent showing a small apartment. Present it honestly, answer questions about rent, utilities, deposit and neighborhood, and handle one negotiation about the price or move-in date.",
    goalPhrases: ["How much is the rent?", "Are utilities included?", "When can I move in?", "Is the area quiet?"],
    tasks: ["Ask about rent and utilities", "Ask about the neighborhood", "Negotiate one condition"],
    minutes: 7,
    levelHint: "B1",
  },
  {
    id: "return-item",
    category: "daily",
    title: "Return a purchase",
    description: "The thing broke. Get a refund or exchange.",
    situation:
      "You are a store clerk at a returns desk, professional but following policy. The learner returns a defective item. Ask for the receipt, offer an exchange first, and grant the refund if they insist politely.",
    goalPhrases: ["I'd like to return this", "It stopped working", "I have the receipt", "I'd prefer a refund"],
    tasks: ["Explain the problem", "Show the receipt", "Insist politely on your preference"],
    minutes: 5,
    levelHint: "A2",
  },
  {
    id: "taxi-chat",
    category: "travel",
    title: "Taxi ride chat",
    description: "Give the address, then survive the driver's friendly chatter.",
    situation:
      "You are a talkative taxi driver. Confirm the destination, then chat about where the learner is from, traffic, and food recommendations. Announce arrival and the fare at the end.",
    goalPhrases: ["To ... please", "I'm visiting from ...", "What do you recommend eating?", "Keep the change"],
    tasks: ["Give your destination", "Answer two of the driver's questions", "Handle the payment"],
    minutes: 5,
    levelHint: "A2",
  },
  {
    id: "pharmacy-run",
    category: "daily",
    title: "At the pharmacy",
    description: "Get the right medicine without knowing its name.",
    situation:
      "You are a patient pharmacist. The learner needs something for a headache or allergy but does not know product names. Ask about symptoms, allergies and current medication, then recommend something and explain the dosage.",
    goalPhrases: ["Something for a headache", "I'm allergic to ...", "How often do I take it?", "Do you have anything stronger?"],
    tasks: ["Describe what you need", "Answer the safety questions", "Confirm the dosage"],
    minutes: 5,
    levelHint: "A2",
  },
  {
    id: "delivery-call",
    category: "daily",
    title: "Order delivery by phone",
    description: "Hungry, no app. Call the restaurant directly.",
    situation:
      "You are a busy but friendly restaurant employee taking phone orders. Take the learner's order, upsell one side dish, ask for the address, and give a realistic delivery time with one complication (an item is sold out).",
    goalPhrases: ["I'd like to order for delivery", "Without onions, please", "How long will it take?", "The address is ..."],
    tasks: ["Order a main dish", "Handle the sold-out item", "Give your address clearly"],
    minutes: 5,
    levelHint: "A2",
  },
  {
    id: "networking-event",
    category: "work",
    title: "Networking event",
    description: "Introduce your work to a stranger and swap contacts.",
    situation:
      "You are an approachable professional at an industry meetup, from an adjacent field to the learner's. Ask what they do, dig into one detail, share what you do, and suggest exchanging contacts before you both move on.",
    goalPhrases: ["What do you do?", "We work on ...", "That's exactly our problem too", "Let's stay in touch"],
    tasks: ["Explain your work in two sentences", "Ask about their work", "Exchange contacts"],
    minutes: 6,
    levelHint: "B1",
  },
  {
    id: "ask-for-raise",
    category: "work",
    title: "Ask for a raise",
    description: "Make the case calmly, handle the pushback.",
    situation:
      "You are the learner's direct manager, fair but budget-conscious. Let them make their case for a raise. Push back once with a budget concern, ask for concrete results, and end with a realistic next step.",
    goalPhrases: ["I'd like to talk about my compensation", "Over the last year I ...", "Based on the market ...", "What would it take?"],
    tasks: ["State your ask directly", "Back it with one concrete result", "Agree on a next step"],
    minutes: 7,
    levelHint: "B2",
  },
  {
    id: "airport-checkin",
    category: "travel",
    title: "Airport check-in problem",
    description: "Overweight bag, tight connection. Sort it out at the counter.",
    situation:
      "You are an airline check-in agent, professional and quick. The learner's bag is 3 kg over the limit and their connection is tight. Offer the standard options (pay the fee, repack, carry on) and answer questions about the connection.",
    goalPhrases: ["My bag is overweight", "How much is the fee?", "Can I take it as carry-on?", "Will I make my connection?"],
    tasks: ["Understand your options", "Choose one and confirm the cost", "Ask about your connection"],
    minutes: 5,
    levelHint: "A2",
  },
  {
    id: "lost-luggage",
    category: "travel",
    title: "Report lost luggage",
    description: "Your bag didn't arrive. File the report, stay calm.",
    situation:
      "You are a baggage-service agent at the airport desk. The learner's suitcase did not arrive. Take the report: flight number, bag description, hotel address. Explain the usual timeline and the compensation for essentials.",
    goalPhrases: ["My suitcase didn't arrive", "It's a blue hard-shell case", "I'm staying at ...", "What happens next?"],
    tasks: ["Describe your bag", "Give your flight and address", "Ask about compensation"],
    minutes: 6,
    levelHint: "A2",
  },
  {
    id: "cooking-show",
    category: "fun",
    title: "Host a cooking show",
    description: "You're live on air. Teach the audience your favorite dish.",
    situation:
      "You are the excited co-host of a live cooking show, and the learner is the guest chef teaching their favorite dish. Ask them to walk through ingredients and steps, react with enthusiasm, and create one small on-air disaster to improvise around.",
    goalPhrases: ["First, you take ...", "Then add ...", "Be careful not to ...", "And that's how you make it"],
    tasks: ["List the main ingredients", "Explain two steps in order", "Handle the on-air disaster"],
    minutes: 6,
    levelHint: "B1",
  },
  {
    id: "mermaid-party",
    category: "fun",
    title: "Plan an underwater party",
    description: "A mermaid needs help planning her reef party. Obviously.",
    situation:
      "You are an enthusiastic mermaid planning a big underwater party at the coral reef. Ask the learner for help choosing music, food and games that work underwater. React dramatically to their ideas.",
    goalPhrases: ["How about ...?", "That won't work because ...", "Let's invite ...", "The best part will be ..."],
    tasks: ["Suggest two party ideas", "Reject one idea with a reason", "Decide the party theme together"],
    minutes: 5,
    levelHint: "A2",
  },
  {
    id: "alien-negotiation",
    category: "fun",
    title: "Convince the aliens",
    description: "First contact. Explain why Earth is worth keeping.",
    situation:
      "You are a skeptical but curious alien commander deciding whether Earth is interesting enough to visit peacefully. Ask the learner to explain human customs, food and music. Be hard to impress but fair.",
    goalPhrases: ["Let me explain ...", "The best thing about Earth is ...", "You should try ...", "Trust me"],
    tasks: ["Explain one human custom", "Recommend one food", "Convince the commander"],
    minutes: 6,
    levelHint: "B1",
  },
];

export const FREE_TALK: Scenario = {
  id: "free-talk",
  category: "daily",
  title: "Free talk",
  description: "No script. Talk about whatever is on your mind today.",
  situation:
    "You are a warm, curious conversation partner. Let the learner steer the topic. Ask natural follow-up questions, share short opinions of your own, and keep the conversation balanced rather than interrogating.",
  goalPhrases: [],
  tasks: [],
  minutes: 10,
};

export function findScenario(id: string | null): Scenario | null {
  if (!id) return null;
  if (id === FREE_TALK.id) return FREE_TALK;
  return SCENARIOS.find((s) => s.id === id) ?? null;
}

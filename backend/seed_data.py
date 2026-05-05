"""Default seed data for the 12 Lifebook categories.

Each category has 4 sections (Premise / Purpose / Vision / Strategy).
Each section is a list of guiding questions every user sees.
The Financial chapter is enriched with content drawn directly from the
user's source Lifebook documents — every account starts with the same
prompts, quotes, and inspiration imagery, then writes their own answers.
"""

# ---------------------------------------------------------------------------
# Categories — meta + seed quotes + seed images (read-only, shared across users)
# ---------------------------------------------------------------------------
CATEGORIES = [
    {
        "slug": "health-fitness",
        "name": "Health & Fitness",
        "order": 1,
        "tagline": "Discipline shapes the body that carries my life.",
        "image": "https://images.unsplash.com/photo-1770563181231-9dfa3b1b06fa",
        "color": "#7B8F6F",
        "description": "What you do outside the gym matters more than what you do inside. Define the daily disciplines that shape your body, energy, and longevity.",
        "seed_quotes": [
            {"text": "Take care of your body. It's the only place you have to live.", "author": "Jim Rohn"},
            {"text": "The greatest wealth is health.", "author": "Virgil"},
        ],
        "seed_images": [
            "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3",
            "https://images.unsplash.com/photo-1518611012118-696072aa579a",
        ],
    },
    {
        "slug": "intellectual",
        "name": "Intellectual",
        "order": 2,
        "tagline": "A thinking life is the most practical life.",
        "image": "https://images.unsplash.com/photo-1649605475588-f5e665789358",
        "color": "#5C6B8A",
        "description": "Your mind is the lens through which everything else is built. Define how you think about your life and program a compelling future.",
        "seed_quotes": [
            {"text": "Thoughts become things.", "author": ""},
            {"text": "All that we are is the result of what we have thought.", "author": "Buddha"},
        ],
        "seed_images": [
            "https://images.unsplash.com/photo-1481627834876-b7833e8f5570",
        ],
    },
    {
        "slug": "emotional",
        "name": "Emotional",
        "order": 3,
        "tagline": "I author the emotions I experience daily.",
        "image": "https://images.unsplash.com/photo-1748183607998-30e288846885",
        "color": "#A38C7A",
        "description": "Define the emotions you want to experience daily and design the recipe to create them on demand.",
        "seed_quotes": [
            {"text": "Between stimulus and response there is a space. In that space is our power to choose our response.", "author": "Viktor Frankl"},
        ],
        "seed_images": [
            "https://images.unsplash.com/photo-1504609813442-a8924e83f76e",
        ],
    },
    {
        "slug": "character",
        "name": "Character",
        "order": 4,
        "tagline": "Who I am is who I choose to become.",
        "image": "https://images.pexels.com/photos/30420424/pexels-photo-30420424.jpeg",
        "color": "#3E4A3D",
        "description": "Character traits shape how you handle every other area of your life. Choose them deliberately.",
        "seed_quotes": [
            {"text": "Character is what you do when nobody is watching.", "author": "John Wooden"},
        ],
        "seed_images": [
            "https://images.unsplash.com/photo-1518837695005-2083093ee35b",
        ],
    },
    {
        "slug": "spiritual",
        "name": "Spiritual",
        "order": 5,
        "tagline": "Purpose is the compass beneath everything.",
        "image": "https://images.unsplash.com/photo-1514185542902-bbfeac2fa9a4",
        "color": "#5E7B6E",
        "description": "Define the deepest 'why' beneath your life — your purpose, contribution, and the philosophy you live by.",
        "seed_quotes": [
            {"text": "The two most important days in your life are the day you are born and the day you find out why.", "author": "Mark Twain"},
        ],
        "seed_images": [
            "https://images.unsplash.com/photo-1474557157379-8aa74a6ef541",
        ],
    },
    {
        "slug": "love-relationship",
        "name": "Love Relationship",
        "order": 6,
        "tagline": "Love is created by what we choose to do.",
        "image": "https://images.unsplash.com/photo-1759309607967-9e56fd347acc",
        "color": "#B8775F",
        "description": "Fulfilling love comes from action, not luck. Define the actions that build the love relationship of your dreams.",
        "seed_quotes": [
            {"text": "We accept the love we think we deserve.", "author": "Stephen Chbosky"},
        ],
        "seed_images": [
            "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00",
        ],
    },
    {
        "slug": "parenting",
        "name": "Parenting",
        "order": 7,
        "tagline": "Raising no-limit humans, one day at a time.",
        "image": "https://images.unsplash.com/photo-1609220136736-443140cffec6",
        "color": "#C8795A",
        "description": "Raise healthy, happy, independent children by the values you live and the time you invest.",
        "seed_quotes": [
            {"text": "There is no school equal to a decent home and no teacher equal to a virtuous parent.", "author": "Mahatma Gandhi"},
        ],
        "seed_images": [
            "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb",
        ],
    },
    {
        "slug": "social",
        "name": "Social",
        "order": 8,
        "tagline": "We rise on the relationships we choose.",
        "image": "https://images.unsplash.com/photo-1529156069898-49953eb1b5a4",
        "color": "#8A9A86",
        "description": "Family, friendships, and business relationships are deliberate. Invest energy where it counts.",
        "seed_quotes": [
            {"text": "You are the average of the five people you spend the most time with.", "author": "Jim Rohn"},
        ],
        "seed_images": [
            "https://images.unsplash.com/photo-1543269865-cbf427effbad",
        ],
    },
    # ----- FINANCIAL — RICHLY SEEDED FROM THE USER'S OWN SOURCE DOC --------
    {
        "slug": "financial",
        "name": "Financial",
        "order": 9,
        "tagline": "Money is stored energy. Treat it well.",
        "image": "https://images.pexels.com/photos/33685861/pexels-photo-33685861.jpeg",
        "color": "#7C6F5A",
        "description": (
            "Money is a tool of trade — a medium of exchange. It standardizes value so we can "
            "trade goods and services more easily, and it stores value for future use. Money is "
            "stored energy: it represents our productive accomplishments, the hard work, the "
            "thinking, and the talents we've offered the world. Money flows to people who treat "
            "it with respect; it flees from those who treat it carelessly. Build a financial life "
            "of long horizons, deliberate sacrifice, and quiet love for what you've earned."
        ),
        "seed_quotes": [
            {
                "text": "Wealth may be an excellent thing, for it means power, it means leisure, it means liberty.",
                "author": "James Russell Lowell",
            },
            {
                "text": "I've been rich and I've been poor. Believe me, rich is better.",
                "author": "Sophie Tucker",
            },
            {
                "text": "Pennies do not come from heaven. They have to be earned here on earth.",
                "author": "Margaret Thatcher",
            },
            {
                "text": "A penny saved is a penny earned.",
                "author": "Benjamin Franklin",
            },
            {
                "text": "If you would be wealthy, think of saving as well as getting.",
                "author": "Benjamin Franklin",
            },
            {
                "text": "When I was young I used to think that money was the most important thing in life. Now that I'm old, I know it is.",
                "author": "Oscar Wilde",
            },
            {
                "text": "Wealth is the slave of a wise man. The master of a fool.",
                "author": "Seneca",
            },
            {
                "text": "It's not how much money you make, but how much money you keep, how hard it works for you, and how many generations you keep it for.",
                "author": "Robert Kiyosaki",
            },
        ],
        "seed_images": [
            "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf",
            "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
            "https://images.unsplash.com/photo-1579621970795-87facc2f976d",
            "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
        ],
    },
    {
        "slug": "career",
        "name": "Career",
        "order": 10,
        "tagline": "Work that I'm proud of, on the world's biggest scale.",
        "image": "https://images.unsplash.com/photo-1612303544167-5871c2331e36",
        "color": "#4A5568",
        "description": "Pick something you enjoy, get great at it, and contribute at the highest level you're capable of.",
        "seed_quotes": [
            {"text": "Choose a job you love, and you will never have to work a day in your life.", "author": "Confucius"},
        ],
        "seed_images": [
            "https://images.unsplash.com/photo-1497366216548-37526070297c",
        ],
    },
    {
        "slug": "quality-of-life",
        "name": "Quality of Life",
        "order": 11,
        "tagline": "My environments are extensions of me.",
        "image": "https://images.pexels.com/photos/33685860/pexels-photo-33685860.jpeg",
        "color": "#A89F8E",
        "description": "Design environments that radiate the values, moods, and feelings you want your life to project.",
        "seed_quotes": [
            {"text": "We shape our buildings; thereafter they shape us.", "author": "Winston Churchill"},
        ],
        "seed_images": [
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
        ],
    },
    {
        "slug": "life-vision",
        "name": "Life Vision",
        "order": 12,
        "tagline": "The integrated vision of the life I am creating.",
        "image": "https://images.unsplash.com/photo-1671435302799-35d7fde02b90",
        "color": "#2F3E35",
        "description": "The North Star — your complete, integrated vision pulling all 12 categories together into one life worth living.",
        "seed_quotes": [
            {"text": "The future belongs to those who believe in the beauty of their dreams.", "author": "Eleanor Roosevelt"},
        ],
        "seed_images": [
            "https://images.unsplash.com/photo-1518837695005-2083093ee35b",
        ],
    },
]


# ---------------------------------------------------------------------------
# Default Q&A prompts — seen by every account
# ---------------------------------------------------------------------------
def default_section_questions(category_slug: str):
    base = {
        "premise": [
            "What core belief or principle do I hold about this area of my life?",
            "What is true for me here that may not be true for everyone?",
            "What assumption am I building this part of my life on?",
        ],
        "purpose": [
            "Why does this category matter to me?",
            "What outcome am I trying to create here?",
            "If I lived this category fully, what would change?",
        ],
        "vision": [
            "What does the ideal version of this area look like 5 years from now?",
            "Describe a perfect day in this category.",
            "What does success in this category feel like?",
        ],
        "strategy": [
            "What concrete actions will I take this quarter?",
            "What habits or routines will I build?",
            "What will I stop doing?",
            "How will I measure progress?",
        ],
    }

    overrides = {
        "health-fitness": {
            "strategy": [
                "What does my weekly exercise plan look like?",
                "What is my daily meal plan and caloric strategy?",
                "How will I manage sleep, stress, and recovery?",
                "What disciplines will I keep outside the gym?",
                "What does staying young mean to me, and how will I do it?",
            ],
        },
        "intellectual": {
            "premise": [
                "Do I believe my thoughts shape my reality?",
                "How do I learn best — what feeds my mind?",
                "Where do I want my thinking to take me?",
            ],
            "strategy": [
                "What incantations or mantras will I repeat daily?",
                "What books, courses, or teachers will I commit to?",
                "How will I think deliberately about each Lifebook category?",
            ],
        },
        "emotional": {
            "premise": [
                "Which emotions do I most want to experience daily?",
                "Which emotions do I want to minimize or avoid?",
                "How aware am I of what triggers my emotions?",
            ],
            "strategy": [
                "What is my recipe for joy, calm, gratitude, love?",
                "How will I respond when negative emotions arise?",
                "What rituals create my best emotional state?",
            ],
        },
        "character": {
            "vision": [
                "What character traits do I want to be known for?",
                "Who is the version of me I most admire?",
                "What virtue, if I built it, would change everything?",
            ],
            "strategy": [
                "How will I turn each virtue into a daily habit?",
                "Which traits will I practice this month?",
                "Who can hold me accountable?",
            ],
        },
        "spiritual": {
            "premise": [
                "What is my philosophy of life?",
                "What do I believe about purpose, contribution, and meaning?",
                "What is my answer to: how can I make things better?",
            ],
        },
        "love-relationship": {
            "strategy": [
                "How will I express love and appreciation daily?",
                "What rituals (date nights, trips, notes) will I keep?",
                "How will we handle conflict, and what will we never do?",
                "What standards do we hold for our relationship?",
            ],
        },
        "parenting": {
            "premise": [
                "What are the core values of our home?",
                "What kind of humans am I raising?",
                "What did I learn from how I was parented — to keep, to change?",
            ],
            "strategy": [
                "How much daily one-on-one time will I give each child?",
                "What rituals do we keep (bedtime, dates, meals)?",
                "How will we teach freedom, responsibility, and respect?",
            ],
        },
        "social": {
            "strategy": [
                "Which family members will I invest more time in?",
                "Which friendships need more energy?",
                "Which business relationships need defining?",
                "How will I be a better friend / sibling / colleague?",
            ],
        },
        # ---------------- FINANCIAL — drawn from the source doc -------------
        "financial": {
            "premise": [
                "What is my philosophy about money — what do I truly believe it is?",
                "Do I see money as a tool of trade — a medium of exchange — and as stored energy?",
                "Do I treat money with love and respect, knowing it flows toward those who do?",
                "Do I believe money is a symbol of human productivity and achievement?",
                "Do I believe wealth eliminates poverty and human suffering — and that making money is a high form of contribution?",
                "Do I believe money is an effect, not a cause — that I must add value first?",
                "Do I believe the bigger my contribution, the bigger my financial reward?",
                "Do I believe money expands who I already am — and reveals character rather than building it?",
                "What does money give me that I cannot get any other way (freedom, time, choice, dignity)?",
            ],
            "purpose": [
                "Why do I want money? What specifically will it let me do for myself and the people I love?",
                "What homes, experiences, freedoms, or contributions does money make possible for me?",
                "How will money improve my quality of life and the lives of those I love?",
                "How does my financial life affect every other Lifebook category?",
                "What do I want to be free FROM — and free TO DO — once money is no longer a question?",
                "Who else benefits when I am financially abundant?",
            ],
            "vision": [
                "What does financial success look like for me — concretely, not abstractly?",
                "How much do I want to earn / be worth this year? In 5 years? In 10? In 15?",
                "Am I destined to be a big financial success? Have I declared it as a fact?",
                "Do I see myself living in an abundant universe — or a scarce one?",
                "What does my healthy, loving relationship with money look and feel like?",
                "When I am financially free, where do I live, what do I do with my days, who am I with?",
            ],
            "strategy": [
                "How far out is my time horizon? Am I making 1-year decisions or 15-year decisions?",
                "What percentage of every paycheck will I pay myself first? (Aim: 10% minimum, never spent.)",
                "How will I keep my expenses growing slower than my income, and invest the spread?",
                "What is my plan to increase income this year? (New skills, role, business, side income.)",
                "What is my investment strategy? Where does the saved money actually go?",
                "How will I leverage compounding — and never lose money I cannot afford to lose?",
                "What financial education will I commit to (books, programs, advisors)?",
                "Have I built a written financial plan with monthly targets?",
                "What system (jars, accounts, automations) will I use to manage cashflow?",
                "What rules do I follow before parting with money on any investment?",
                "What financial decisions am I currently deferring that need attention this month?",
            ],
        },
        "career": {
            "strategy": [
                "What clear, quantifiable career goals do I have for this year?",
                "What are my career strengths to lean into?",
                "What are my weaknesses, and who do I need around me?",
                "What is the one battle I will focus on this quarter?",
            ],
        },
        "quality-of-life": {
            "strategy": [
                "What environments do I spend time in, and do they reflect me?",
                "How will I bring tranquility and order to my home?",
                "What sensory upgrades (light, sound, scent, nature) will I make?",
                "What clutter or chaos must go?",
            ],
        },
        "life-vision": {
            "premise": [
                "When all 12 categories integrate, what is my one life about?",
                "What is the through-line of all my categories?",
                "What sentence captures the life I am building?",
            ],
            "purpose": [
                "Why am I building this Atlas?",
                "Who benefits when I live this vision fully?",
            ],
            "vision": [
                "Describe your ideal life in one paragraph, in present tense.",
                "What will you have created in 10 years?",
                "What will be your legacy?",
            ],
            "strategy": [
                "How will I review this Atlas (weekly, monthly, every 6 months)?",
                "What is my one most important commitment for this year?",
                "How will I know I am on track?",
            ],
        },
    }

    result = {k: list(v) for k, v in base.items()}
    for section, questions in overrides.get(category_slug, {}).items():
        result[section] = questions
    return result


SECTION_LABELS = {
    "premise": "Premise",
    "purpose": "Purpose",
    "vision": "Vision",
    "strategy": "Strategy",
}

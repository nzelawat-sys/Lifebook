"""Default seed data for the 12 Lifebook categories.

Each category has 4 sections (Premise / Purpose / Vision / Strategy).
Each section is a list of guiding questions the user will answer.
Content is distilled from the Lifebook framework essays.
"""

CATEGORIES = [
    {
        "slug": "health-fitness",
        "name": "Health & Fitness",
        "order": 1,
        "tagline": "Discipline shapes the body that carries my life.",
        "image": "https://images.unsplash.com/photo-1770563181231-9dfa3b1b06fa",
        "color": "#7B8F6F",
        "description": "What you do outside the gym matters more than what you do inside. Define the daily disciplines that shape your body, energy, and longevity.",
    },
    {
        "slug": "intellectual",
        "name": "Intellectual",
        "order": 2,
        "tagline": "A thinking life is the most practical life.",
        "image": "https://images.unsplash.com/photo-1649605475588-f5e665789358",
        "color": "#5C6B8A",
        "description": "Your mind is the lens through which everything else is built. Define how you think about your life and program a compelling future.",
    },
    {
        "slug": "emotional",
        "name": "Emotional",
        "order": 3,
        "tagline": "I author the emotions I experience daily.",
        "image": "https://images.unsplash.com/photo-1748183607998-30e288846885",
        "color": "#A38C7A",
        "description": "Define the emotions you want to experience daily and design the recipe to create them on demand.",
    },
    {
        "slug": "character",
        "name": "Character",
        "order": 4,
        "tagline": "Who I am is who I choose to become.",
        "image": "https://images.pexels.com/photos/30420424/pexels-photo-30420424.jpeg",
        "color": "#3E4A3D",
        "description": "Character traits shape how you handle every other area of your life. Choose them deliberately.",
    },
    {
        "slug": "spiritual",
        "name": "Spiritual",
        "order": 5,
        "tagline": "Purpose is the compass beneath everything.",
        "image": "https://images.unsplash.com/photo-1514185542902-bbfeac2fa9a4",
        "color": "#5E7B6E",
        "description": "Define the deepest 'why' beneath your life — your purpose, contribution, and the philosophy you live by.",
    },
    {
        "slug": "love-relationship",
        "name": "Love Relationship",
        "order": 6,
        "tagline": "Love is created by what we choose to do.",
        "image": "https://images.unsplash.com/photo-1759309607967-9e56fd347acc",
        "color": "#B8775F",
        "description": "Fulfilling love comes from action, not luck. Define the actions that build the love relationship of your dreams.",
    },
    {
        "slug": "parenting",
        "name": "Parenting",
        "order": 7,
        "tagline": "Raising no-limit humans, one day at a time.",
        "image": "https://images.unsplash.com/photo-1609220136736-443140cffec6",
        "color": "#C8795A",
        "description": "Raise healthy, happy, independent children by the values you live and the time you invest.",
    },
    {
        "slug": "social",
        "name": "Social",
        "order": 8,
        "tagline": "We rise on the relationships we choose.",
        "image": "https://images.unsplash.com/photo-1529156069898-49953eb1b5a4",
        "color": "#8A9A86",
        "description": "Family, friendships, and business relationships are deliberate. Invest energy where it counts.",
    },
    {
        "slug": "financial",
        "name": "Financial",
        "order": 9,
        "tagline": "Money is stored energy. Treat it well.",
        "image": "https://images.pexels.com/photos/33685861/pexels-photo-33685861.jpeg",
        "color": "#7C6F5A",
        "description": "Money is a tool of trade. Build a financial life of discipline, long horizons, and respect for what you've earned.",
    },
    {
        "slug": "career",
        "name": "Career",
        "order": 10,
        "tagline": "Work that I'm proud of, on the world's biggest scale.",
        "image": "https://images.unsplash.com/photo-1612303544167-5871c2331e36",
        "color": "#4A5568",
        "description": "Pick something you enjoy, get great at it, and contribute at the highest level you're capable of.",
    },
    {
        "slug": "quality-of-life",
        "name": "Quality of Life",
        "order": 11,
        "tagline": "My environments are extensions of me.",
        "image": "https://images.pexels.com/photos/33685860/pexels-photo-33685860.jpeg",
        "color": "#A89F8E",
        "description": "Design environments that radiate the values, moods, and feelings you want your life to project.",
    },
    {
        "slug": "life-vision",
        "name": "Life Vision",
        "order": 12,
        "tagline": "The integrated vision of the life I am creating.",
        "image": "https://images.unsplash.com/photo-1671435302799-35d7fde02b90",
        "color": "#2F3E35",
        "description": "The North Star — your complete, integrated vision pulling all 12 categories together into one life worth living.",
    },
]


def default_section_questions(category_slug: str):
    """Return default Premise/Purpose/Vision/Strategy questions for a category."""
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

    # Category-specific overrides for richer prompts
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
        "financial": {
            "premise": [
                "What is my philosophy about money?",
                "Do I treat money with love and respect?",
                "What does financial freedom mean to me?",
            ],
            "strategy": [
                "What % of income will I save and invest?",
                "What does my long-term investment plan look like?",
                "How will I increase income and reduce expenses?",
                "What financial decisions am I deferring that need attention?",
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

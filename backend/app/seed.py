from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models as m
from .database import SessionLocal

ACHIEVEMENTS = [
    ("FIRST_LESSON", "First Steps", "Complete your first lesson", "👟"),
    ("XP_100", "XP Hunter", "Earn 100 total XP", "⚡"),
    ("XP_500", "XP Champion", "Earn 500 total XP", "🏆"),
    ("STREAK_3", "On Fire", "Reach a 3 day streak", "🔥"),
    ("STREAK_7", "Week Warrior", "Reach a 7 day streak", "🗓️"),
    ("FIRST_SKILL", "Scholar", "Complete your first skill", "🎓"),
    ("PERFECT", "Flawless", "Finish a lesson without mistakes", "💎"),
    ("LEGENDARY", "Legendary", "Make a skill legendary", "🟣"),
]

SKILLS = [
    ("Basics 1", "Meet and greet people", "👋"),
    ("Basics 2", "People and simple objects", "🧑"),
    ("Phrases", "Useful everyday phrases", "💬"),
    ("Food", "Order food and drinks", "🍎"),
    ("Family", "Talk about your family", "🏠"),
    ("Travel", "Get around town", "🧳"),
    ("Present", "Build present-tense sentences", "⏰"),
    ("Stories", "Understand short conversations", "📖"),
    ("Review", "Master everything you learned", "🏆"),
]

VOCAB = [
    ("hola", "hello"),
    ("adiós", "goodbye"),
    ("hombre", "man"),
    ("mujer", "woman"),
    ("niño", "boy"),
    ("manzana", "apple"),
    ("agua", "water"),
    ("familia", "family"),
    ("casa", "house"),
    ("tren", "train"),
    ("libro", "book"),
    ("amigo", "friend"),
    ("comer", "to eat"),
    ("beber", "to drink"),
    ("gracias", "thank you"),
]


def exercise_set(lesson_index: int) -> list[dict]:
    a = VOCAB[lesson_index % len(VOCAB)]
    b = VOCAB[(lesson_index + 1) % len(VOCAB)]
    c = VOCAB[(lesson_index + 2) % len(VOCAB)]
    return [
        {
            "type": m.ExerciseType.MULTIPLE_CHOICE,
            "instruction": "Select the correct meaning",
            "prompt": a[0].capitalize(),
            "payload": {"options": [a[1], b[1], c[1], "please"]},
            "answers": [a[1]],
            "canonical": a[1],
            "explanation": f"“{a[0]}” means “{a[1]}”.",
            "audio": a[0],
        },
        {
            "type": m.ExerciseType.WORD_BANK,
            "instruction": "Translate this sentence",
            "prompt": "I have a book",
            "payload": {"words": ["Yo", "tengo", "un", "libro", "una", "es"]},
            "answers": ["Yo tengo un libro"],
            "canonical": "Yo tengo un libro",
            "explanation": "Use tengo for “I have”.",
            "audio": "Yo tengo un libro",
        },
        {
            "type": m.ExerciseType.MATCH_PAIRS,
            "instruction": "Tap the matching pairs",
            "prompt": "Match the words",
            "payload": {"left": [a[0], b[0], c[0]], "right": [c[1], a[1], b[1]]},
            "answers": [[[a[0], a[1]], [b[0], b[1]], [c[0], c[1]]]],
            "canonical": f"{a[0]} ↔ {a[1]}",
            "explanation": "Each Spanish word has one English match.",
            "audio": None,
        },
        {
            "type": m.ExerciseType.FILL_BLANK,
            "instruction": "Fill in the blank",
            "prompt": "Yo ___ agua",
            "payload": {"options": ["bebo", "comes", "somos"]},
            "answers": ["bebo"],
            "canonical": "bebo",
            "explanation": "Bebo means “I drink”.",
            "audio": "Yo bebo agua",
        },
        {
            "type": m.ExerciseType.TYPE_ANSWER,
            "instruction": "Type the answer in Spanish",
            "prompt": a[1].capitalize(),
            "payload": {"placeholder": "Type in Spanish"},
            "answers": [a[0]],
            "canonical": a[0],
            "explanation": f"The Spanish word is “{a[0]}”.",
            "audio": a[0],
        },
    ]


def seed_database(db: Session) -> None:
    if db.scalar(select(m.AppMeta).where(m.AppMeta.key == "content_version")):
        return
    course = m.Course(id=1, title="Spanish", language="Spanish", flag="🇪🇸")
    db.add(course)
    db.flush()
    previous_skill_id = None
    lesson_index = 0
    for unit_position in range(1, 4):
        unit = m.Unit(
            course_id=course.id,
            title=f"Section {unit_position}",
            description=[
                "Rookie: start with the essentials",
                "Explorer: talk about everyday life",
                "Traveler: grow your Spanish skills",
            ][unit_position - 1],
            position=unit_position,
        )
        db.add(unit)
        db.flush()
        for local_skill in range(3):
            skill_position = (unit_position - 1) * 3 + local_skill
            title, description, icon = SKILLS[skill_position]
            skill = m.Skill(
                unit_id=unit.id,
                title=title,
                description=description,
                icon=icon,
                position=local_skill + 1,
                prerequisite_skill_id=previous_skill_id,
            )
            db.add(skill)
            db.flush()
            previous_skill_id = skill.id
            for lesson_position in range(1, 4):
                lesson_index += 1
                lesson = m.Lesson(
                    skill_id=skill.id,
                    title=f"{title} · Lesson {lesson_position}",
                    position=lesson_position,
                )
                db.add(lesson)
                db.flush()
                for position, item in enumerate(exercise_set(lesson_index), 1):
                    db.add(
                        m.Exercise(
                            lesson_id=lesson.id,
                            type=item["type"],
                            instruction=item["instruction"],
                            prompt=item["prompt"],
                            payload=item["payload"],
                            accepted_answers=item["answers"],
                            canonical_answer=item["canonical"],
                            explanation=item["explanation"],
                            audio_text=item["audio"],
                            position=position,
                        )
                    )
    for code, title, description, icon in ACHIEVEMENTS:
        db.add(m.Achievement(code=code, title=title, description=description, icon=icon))
    users = [
        (1, "Aarav", "duo", 140, 4, 620, 3),
        (2, "Maya", "lily", 480, 5, 850, 12),
        (3, "Zari", "zari", 390, 4, 710, 8),
        (4, "Oscar", "oscar", 310, 5, 540, 5),
        (5, "Eddy", "eddy", 225, 3, 430, 2),
        (6, "Bea", "bea", 180, 5, 390, 4),
        (7, "Junior", "junior", 90, 4, 280, 1),
        (8, "Falstaff", "falstaff", 60, 5, 260, 0),
    ]
    all_skills = list(db.scalars(select(m.Skill).order_by(m.Skill.id)))
    for user_id, name, avatar, xp, hearts, gems, streak in users:
        user = m.User(
            id=user_id,
            name=name,
            avatar=avatar,
            total_xp=xp,
            hearts=hearts,
            gems=gems,
            current_streak=streak,
            longest_streak=max(streak, 7),
            last_activity_date=m.utcnow().date() - timedelta(days=1),
            theme="dark",
        )
        db.add(user)
        db.flush()
        db.add(m.UserCourse(user_id=user.id, course_id=course.id, course_score=0))
        for index, skill in enumerate(all_skills):
            state = m.ProgressState.AVAILABLE if index == 0 else m.ProgressState.LOCKED
            crowns = 0
            db.add(
                m.UserSkillProgress(user_id=user.id, skill_id=skill.id, state=state, crowns=crowns)
            )
        db.add(
            m.XPTransaction(
                user_id=user.id, amount=xp, source="SEED", idempotency_key=f"seed:{user.id}"
            )
        )
    db.add(m.AppMeta(key="content_version", value="1"))
    db.commit()


def main() -> None:
    with SessionLocal() as db:
        seed_database(db)


if __name__ == "__main__":
    main()

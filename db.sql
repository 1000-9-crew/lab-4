-- PG SMALL (cascade cycle??!!)
CREATE TABLE "User"
(
    "id"       SERIAL PRIMARY KEY,
    "name"     VARCHAR(50) NOT NULL,
    "login"    VARCHAR(50) NOT NULL,
    "password" VARCHAR(50) NOT NULL,
    "role"     VARCHAR(50) NOT NULL
);

CREATE TABLE "Subject"
(
    "id"        SERIAL PRIMARY KEY,
    "teacherId" INTEGER,
    "name"      VARCHAR(100) NOT NULL,
    CONSTRAINT "subject_user_id_fk"
        FOREIGN KEY ("teacherId") REFERENCES "User" ("id")
            ON UPDATE CASCADE
            ON DELETE SET NULL
);

CREATE TABLE "Enrollment"
(
    "subjectId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    PRIMARY KEY ("subjectId", "studentId"),
    CONSTRAINT "enrollment_subject_id_fk"
        FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id")
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    CONSTRAINT "enrollment_user_id_fk"
        FOREIGN KEY ("studentId") REFERENCES "User" ("id")
            ON UPDATE CASCADE
            ON DELETE CASCADE
);

CREATE TABLE "Lesson"
(
    "id"        SERIAL PRIMARY KEY,
    "subjectId" INTEGER      NOT NULL,
    "name"      VARCHAR(100) NOT NULL,
    "date"      DATE         NOT NULL,
    CONSTRAINT "lesson_subject_id_fk"
        FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id")
            ON UPDATE CASCADE
            ON DELETE CASCADE
);

CREATE TABLE "Mark"
(
    "id"         SERIAL PRIMARY KEY,
    "lessonId"   INTEGER NOT NULL,
    "studentId"  INTEGER NOT NULL,
    "mark"       INTEGER,
    "attendance" BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT "mark_lesson_id_fk"
        FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id")
            ON UPDATE CASCADE
            ON DELETE CASCADE,
    CONSTRAINT "mark_user_Id_fk"
        FOREIGN KEY ("studentId") REFERENCES "User" ("id")
            ON UPDATE CASCADE
            ON DELETE CASCADE
);


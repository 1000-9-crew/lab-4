const pool = require("./db");
const { Mark, LessonMark, MarkDetails, StudentMark } = require("../model/Mark");
const { Subject } = require("../model/Subject");
const { Lesson } = require("../model/Lesson");
const { Student } = require("../model/User");
const { Enrollment } = require("../model/Enrollment");

exports.findSubjectsbyStudentId = async (studentId) => {
    const query = `
        SELECT s.*
        FROM "Subject" s
        JOIN "Enrollment" e ON s.id = e."subjectId"
        WHERE e."studentId" = $1
    `;
    const result = await pool.query(query, [studentId]);
    return result.rows.map(row => Subject.fromJson(row));
};

exports.findSubjectsByTeacherId = async (teacherId) => {
    const query = `SELECT * FROM "Subject" WHERE "teacherId" = $1`;
    const result = await pool.query(query, [teacherId]);
    return result.rows.map(row => Subject.fromJson(row));
};

exports.findSubjectById = async (subjectId) => {
    const query = `SELECT * FROM "Subject" WHERE "id" = $1`;
    const result = await pool.query(query, [subjectId]);
    return result.rows.length ? Subject.fromJson(result.rows[0]) : null;
};

exports.findLessonById = async (lessonId) => {
    const query = `SELECT * FROM "Lesson" WHERE "id" = $1`;
    const result = await pool.query(query, [lessonId]);
    return result.rows.length ? Lesson.fromJson(result.rows[0]) : null;
};

exports.findLessonsBySubjectId = async (subjectId) => {
    const query = `SELECT * FROM "Lesson" WHERE "subjectId" = $1`;
    const result = await pool.query(query, [subjectId]);
    return result.rows.map(row => Lesson.fromJson(row));
};

exports.findMarksByStudentIdAndSubjectId = async (studentId, subjectId) => {
    const query = `
        SELECT l.*, m."mark", m."attendance"
        FROM "Lesson" l
        LEFT JOIN "Mark" m ON l.id = m."lessonId" AND m."studentId" = $1
        WHERE l."subjectId" = $2
    `;
    const result = await pool.query(query, [studentId, subjectId]);
    return result.rows.map(row => new LessonMark(
        Lesson.fromJson(row),
        new MarkDetails(row.mark, row.attendance)
    ));
};

exports.findEnrolledStudentsBySubjectId = async (subjectId) => {
    const query = `
        SELECT u.*
        FROM "User" u
        JOIN "Enrollment" e ON u.id = e."studentId"
        WHERE e."subjectId" = $1
    `;
    const result = await pool.query(query, [subjectId]);
    return result.rows.map(row => Student.fromJson(row));
};

exports.findUnEnrolledStudentsBySubjectId = async (subjectId) => {
    const query = `
        SELECT u.*
        FROM "User" u
        WHERE u.role = 'student' AND u.id NOT IN (
            SELECT "studentId"
            FROM "Enrollment"
            WHERE "subjectId" = $1
        )
    `;
    const result = await pool.query(query, [subjectId]);
    return result.rows.map(row => Student.fromJson(row));
};

exports.findMarksWithStudentByLessonId = async (lessonId) => {
    const query = `
        SELECT m.*, u."name" AS "studentName"
        FROM "Mark" m
        JOIN "User" u ON m."studentId" = u.id
        WHERE m."lessonId" = $1
    `;
    const result = await pool.query(query, [lessonId]);
    return result.rows.map(row => new StudentMark(
        row.id,
        new Student(row.studentId, row.studentName),
        row.mark,
        row.attendance
    ));
};

exports.insertSubject = async (subject) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const query = `
            INSERT INTO "Subject" ("teacherId", "name")
            VALUES ($1, $2)
            RETURNING *
        `;
        const values = [subject.teacherId, subject.name];
        const result = await client.query(query, values);
        await client.query("COMMIT");
        return Subject.fromJson(result.rows[0]);
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

exports.insertLesson = async (lesson) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const query = `
            INSERT INTO "Lesson" ("subjectId", "name", "date")
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [lesson.subjectId, lesson.name, lesson.date];
        const result = await client.query(query, values);
        await client.query("COMMIT");
        return Lesson.fromJson(result.rows[0]);
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

exports.removeLessonById = async (lessonId) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const query = `DELETE FROM "Lesson" WHERE "id" = $1 RETURNING *`;
        const result = await client.query(query, [lessonId]);
        await client.query("COMMIT");
        return result.rowCount > 0;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

exports.insertMark = async (mark) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const query = `
            INSERT INTO "Mark" ("lessonId", "studentId", "mark", "attendance")
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [mark.lessonId, mark.studentId, mark.mark, mark.attendance];
        const result = await client.query(query, values);
        await client.query("COMMIT");
        return Mark.fromJson(result.rows[0]);
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

exports.findMarkById = async (markId) => {
    const query = `SELECT * FROM "Mark" WHERE "id" = $1`;
    const result = await pool.query(query, [markId]);
    return result.rows.length ? Mark.fromJson(result.rows[0]) : null;
};

exports.removeMarkById = async (markId) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const query = `DELETE FROM "Mark" WHERE "id" = $1 RETURNING *`;
        const result = await client.query(query, [markId]);
        await client.query("COMMIT");
        return result.rowCount > 0;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

exports.updateMarkById = async (markId, newMark) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const query = `
            UPDATE "Mark"
            SET "mark" = $1, "attendance" = $2
            WHERE "id" = $3
            RETURNING *
        `;
        const values = [newMark.mark, newMark.attendance, markId];
        const result = await client.query(query, values);
        await client.query("COMMIT");
        return result.rows.length ? Mark.fromJson(result.rows[0]) : null;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

exports.insertEnrollment = async (enrollment) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const query = `
            INSERT INTO "Enrollment" ("subjectId", "studentId")
            VALUES ($1, $2)
            RETURNING *
        `;
        const values = [enrollment.subjectId, enrollment.studentId];
        const result = await client.query(query, values);
        await client.query("COMMIT");
        return Enrollment.fromJson(result.rows[0]);
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

exports.removeEnrollmentBySubjectIdAndStudentId = async (subjectId, studentId) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Delete marks of the student for lessons in the subject
        const deleteMarksQuery = `
            DELETE FROM "Mark"
            WHERE "studentId" = $1 AND "lessonId" IN (
                SELECT "id" FROM "Lesson" WHERE "subjectId" = $2
            )
        `;
        await client.query(deleteMarksQuery, [studentId, subjectId]);

        // throw new Error("ROLLBACK TEST");

        // Delete enrollment
        const deleteEnrollmentQuery = `
            DELETE FROM "Enrollment"
            WHERE "subjectId" = $1 AND "studentId" = $2
            RETURNING *
        `;
        const result = await client.query(deleteEnrollmentQuery, [subjectId, studentId]);

        await client.query("COMMIT");
        return result.rowCount > 0;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

exports.findEnrollmentBySubjectIdAndStudentId = async (subjectId, studentId) => {
    const query = `
        SELECT * FROM "Enrollment"
        WHERE "subjectId" = $1 AND "studentId" = $2
    `;
    const result = await pool.query(query, [subjectId, studentId]);
    return result.rows.length ? Enrollment.fromJson(result.rows[0]) : null;
};
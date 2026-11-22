const pool = require("../config/db");

// 1. Create a new project
async function createProject(projectName) {
    if (!projectName || !projectName.trim()) {
        throw new Error("Project name is required");
    }

    const query = `
        INSERT INTO projects (project_name)
        VALUES ($1)
        RETURNING *;
    `;

    const result = await pool.query(query, [projectName.trim()]);

    return result.rows[0];
}


async function getProjectById(projectId) {
    const query = `
        SELECT * FROM projects
        WHERE project_id = $1;
    `;

    const result = await pool.query(query, [projectId]);

    return result.rows[0];
}

async function getAllProjects() {
    const query = `
        SELECT * FROM projects
        ORDER BY created_at DESC;
    `;

    const result = await pool.query(query);

    return result.rows;
}


async function updateProject(projectId, projectName) {
    if (!projectName || !projectName.trim()) {
        throw new Error("Project name is required");
    }

    const query = `
        UPDATE projects
        SET project_name = $1,
            updated_at = NOW()
        WHERE project_id = $2
        RETURNING *;
    `;

    const result = await pool.query(query, [
        projectName.trim(),
        projectId
    ]);

    return result.rows[0];
}

async function deleteProject(projectId) {
    const query = `
        DELETE FROM projects
        WHERE project_id = $1
        RETURNING *;
    `;

    const result = await pool.query(query, [projectId]);

    return result.rows[0];
}


async function saveFile(projectId, filename, language, content) {
    const query = `
        INSERT INTO files (project_id, filename, language, content)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (project_id, filename)
        DO UPDATE SET
            language = EXCLUDED.language,
            content = EXCLUDED.content,
            updated_at = NOW()
        RETURNING *;
    `;

    const result = await pool.query(query, [
        projectId,
        filename,
        language,
        content
    ]);

    return result.rows[0];
}


async function getProjectFiles(projectId) {
    const query = `
        SELECT * FROM files
        WHERE project_id = $1
        ORDER BY filename;
    `;

    const result = await pool.query(query, [projectId]);

    return result.rows;
}


async function getFile(projectId, filename) {
    const query = `
        SELECT * FROM files
        WHERE project_id = $1
        AND filename = $2;
    `;

    const result = await pool.query(query, [
        projectId,
        filename
    ]);

    return result.rows[0];
}


async function deleteFile(projectId, filename) {
    const query = `
        DELETE FROM files
        WHERE project_id = $1
        AND filename = $2
        RETURNING *;
    `;

    const result = await pool.query(query, [
        projectId,
        filename
    ]);

    return result.rows[0];
}


module.exports = {
    createProject,
    getProjectById,
    getAllProjects,
    updateProject,
    deleteProject,
    saveFile,
    getProjectFiles,
    getFile,
    deleteFile
};
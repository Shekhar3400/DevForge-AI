package com.devforgeai.entity;

public enum Role {
    OWNER,      // full access — project creator
    ADMIN,      // manage all resources in the project
    DEVELOPER,  // create/edit but cannot delete projects
    VIEWER      // read-only
}

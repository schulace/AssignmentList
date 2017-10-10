CREATE TABLE IF NOT EXISTS users (
userid    SERIAL PRIMARY KEY,
name      VARCHAR(30) NOT NULL UNIQUE,
pass_hash varchar,
email     VARCHAR(40) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS posts (
postid SERIAL PRIMARY KEY,
userid INTEGER,
title  VARCHAR(50) NOT NULL,
body   TEXT        NOT NULL,
time   DATE DEFAULT current_timestamp,
FOREIGN KEY (userid) REFERENCES users);
CREATE TABLE IF NOT EXISTS votes (
direction INTEGER NOT NULL,
time      DATE DEFAULT current_timestamp,
userid    INTEGER,
postid    INTEGER,
CHECK (direction = -1 OR direction = 1),
FOREIGN KEY (postid) REFERENCES posts,
FOREIGN KEY (userid) REFERENCES users);
CREATE TABLE IF NOT EXISTS comments (
postid     INTEGER,
userid      INTEGER,
time        DATE DEFAULT current_timestamp,
usercomment TEXT,
FOREIGN KEY (postid) REFERENCES posts,
FOREIGN KEY (userid) REFERENCES users);
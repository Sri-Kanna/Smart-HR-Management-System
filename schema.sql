CREATE TABLE Departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE JobRoles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    base_salary NUMERIC NOT NULL,
    dept_id INTEGER NOT NULL REFERENCES Departments(id)
);

CREATE TABLE Employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    role_id INTEGER NOT NULL REFERENCES JobRoles(id),
    skills TEXT[]
);

CREATE TABLE Attendance (
    id SERIAL PRIMARY KEY,
    emp_id INTEGER NOT NULL REFERENCES Employees(id),
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Present', 'Absent'))
);

CREATE TABLE Performance (
    id SERIAL PRIMARY KEY,
    emp_id INTEGER NOT NULL REFERENCES Employees(id),
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
    review_date DATE NOT NULL,
    topic VARCHAR(255) NOT NULL
);

CREATE TABLE Dependents (
    id SERIAL PRIMARY KEY,
    emp_id INTEGER NOT NULL REFERENCES Employees(id),
    name VARCHAR(255) NOT NULL,
    relation VARCHAR(255) NOT NULL
);

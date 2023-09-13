const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

require('dotenv').config();

const postsRouter = require('./routes/posts.router');

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());
app.use(express.json());
app.use("/api/v1/posts", postsRouter);

const PORT = process.env.PORT || 3000;

// Create a database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});
  
// 8. Retrieve professors and the associated students by professor EMP_NUM
app.get('/api/professors-students-by-professor/:empNum', (req, res) => {
  const empNum = req.params.empNum;
  const query = `
    SELECT CONCAT(e.EMP_FNAME, ' ', e.EMP_LNAME, '-', e.EMP_NUM) AS Professor, CONCAT(s.STU_FNAME, ' ', s.STU_LNAME) as Students 
    FROM student s
    LEFT JOIN department d ON s.DEPT_CODE = d.DEPT_CODE
    LEFT JOIN professor p ON d.DEPT_CODE = p.DEPT_CODE
    LEFT JOIN employee e ON p.EMP_NUM = e.EMP_NUM
    WHERE p.EMP_NUM = ?
  `;

  db.query(query, [empNum], (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

// Define the POST route for inserting data into the student table
app.post('/api/insert-student', (req, res) => {
  // Extract data from the request body
  const {
    STU_NUM,
    STU_LNAME,
    STU_FNAME,
    STU_INIT,
    STU_DOB,
    STU_HRS,
    STU_CLASS,
    STU_GPA,
    STU_TRANSFER,
    DEPT_CODE,
    STU_PHONE,
    PROF_NUM,
  } = req.body;

  // Create an SQL query to insert the data into the student table
  const query = `INSERT INTO student (
    STU_NUM,
    STU_LNAME,
    STU_FNAME,
    STU_INIT,
    STU_DOB,
    STU_HRS,
    STU_CLASS,
    STU_GPA,
    STU_TRANSFER,
    DEPT_CODE,
    STU_PHONE,
    PROF_NUM
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  // Execute the query with the provided data
  db.query(
    query,
    [
      STU_NUM,
      STU_LNAME,
      STU_FNAME,
      STU_INIT,
      STU_DOB,
      STU_HRS,
      STU_CLASS,
      STU_GPA,
      STU_TRANSFER,
      DEPT_CODE,
      STU_PHONE,
      PROF_NUM,
    ],
    (error, results) => {
      if (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        console.log('Data inserted successfully');
        res.status(200).json({ message: 'Data inserted successfully' });
      }
    }
  );
});

// Define the PUT route for updating data of a student by STU_NUM
app.put('/api/update-student/:stuNum', (req, res) => {
  const stuNum = req.params.stuNum; // Get the student number from the URL parameter

  // Extract data from the request body
  const {
    STU_LNAME,
    STU_FNAME,
    STU_INIT,
    STU_DOB,
    STU_HRS,
    STU_CLASS,
    STU_GPA,
    STU_TRANSFER,
    DEPT_CODE,
    STU_PHONE,
    PROF_NUM,
  } = req.body;

  // Create an SQL query to update the data of the student with the specified STU_NUM
  const query = `
    UPDATE student
    SET
      STU_LNAME = ?,
      STU_FNAME = ?,
      STU_INIT = ?,
      STU_DOB = ?,
      STU_HRS = ?,
      STU_CLASS = ?,
      STU_GPA = ?,
      STU_TRANSFER = ?,
      DEPT_CODE = ?,
      STU_PHONE = ?,
      PROF_NUM = ?
    WHERE STU_NUM = ?
  `;

  // Execute the query with the provided data
  db.query(
    query,
    [
      STU_LNAME,
      STU_FNAME,
      STU_INIT,
      STU_DOB,
      STU_HRS,
      STU_CLASS,
      STU_GPA,
      STU_TRANSFER,
      DEPT_CODE,
      STU_PHONE,
      PROF_NUM,
      stuNum,
    ],
    (error, results) => {
      if (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        console.log('Data updated successfully');
        res.status(200).json({ message: 'Data updated successfully' });
      }
    }
  );
});

// Define the DELETE route for deleting a student by STU_NUM
app.delete('/api/delete-student/:stuNum', (req, res) => {
  const stuNum = req.params.stuNum; // Get the student number from the URL parameter

  // Create an SQL query to delete the student with the specified STU_NUM
  const query = `
    DELETE FROM student
    WHERE STU_NUM = ?
  `;

  // Execute the query with the provided student number
  db.query(query, [stuNum], (error, results) => {
    if (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (results.affectedRows === 1) {
        console.log('Student deleted successfully');
        res.status(200).json({ message: 'Student deleted successfully' });
      } else {
        // If no student with the specified STU_NUM was found
        res.status(404).json({ error: 'Student not found' });
      }
    }
  });
});

  // 9. Retrieve professors and their hire dates
  app.get('/api/professors-hire-dates', (req, res) => {
    const query = `
      SELECT CONCAT(e.EMP_FNAME, ' ', e.EMP_LNAME, '-', e.EMP_NUM) AS Professor, DATE_FORMAT(e.EMP_HIREDATE, '%Y/%m/%d') as DateHired
      FROM employee e
      LEFT JOIN professor p ON e.EMP_NUM = p.EMP_NUM
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(results);
      }
    });
  });

  // Define the POST route for adding a new employee
app.post('/api/add-employee', (req, res) => {
  // Extract data from the request body
  const {
    EMP_NUM,
    EMP_LNAME,
    EMP_FNAME,
    EMP_INITIAL,
    EMP_JOBCODE,
    EMP_HIREDATE,
    EMP_DOB,
  } = req.body;

  // Create an SQL query to insert the data into the EMPLOYEE table
  const query = `INSERT INTO employee (
    EMP_NUM,
    EMP_LNAME,
    EMP_FNAME,
    EMP_INITIAL,
    EMP_JOBCODE,
    EMP_HIREDATE,
    EMP_DOB
  ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  // Execute the query with the provided data
  db.query(
    query,
    [
      EMP_NUM,
      EMP_LNAME,
      EMP_FNAME,
      EMP_INITIAL,
      EMP_JOBCODE,
      EMP_HIREDATE,
      EMP_DOB,
    ],
    (error, results) => {
      if (error) {
        console.error('Error adding employee:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        console.log('Employee added successfully');
        res.status(200).json({ message: 'Employee added successfully' });
      }
    }
  );
});

// Define the PUT route for updating employee data by EMP_NUM
app.put('/api/update-employee/:empNum', (req, res) => {
  const empNum = req.params.empNum; // Get the employee number from the URL parameter

  // Extract data from the request body
  const {
    EMP_LNAME,
    EMP_FNAME,
    EMP_INITIAL,
    EMP_JOBCODE,
    EMP_HIREDATE,
    EMP_DOB,
  } = req.body;

  // Create an SQL query to update the data of the employee with the specified EMP_NUM
  const query = `
    UPDATE EMPLOYEE
    SET
      EMP_LNAME = ?,
      EMP_FNAME = ?,
      EMP_INITIAL = ?,
      EMP_JOBCODE = ?,
      EMP_HIREDATE = ?,
      EMP_DOB = ?
    WHERE EMP_NUM = ?
  `;

  // Execute the query with the provided data
  db.query(
    query,
    [
      EMP_LNAME,
      EMP_FNAME,
      EMP_INITIAL,
      EMP_JOBCODE,
      EMP_HIREDATE,
      EMP_DOB,
      empNum,
    ],
    (error, results) => {
      if (error) {
        console.error('Error updating employee data:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        // Check if any rows were affected to determine if the employee was found and updated
        if (results.affectedRows === 1) {
          console.log('Employee data updated successfully');
          res.status(200).json({ message: 'Employee data updated successfully' });
        } else {
          // No rows were affected, meaning the employee with the specified EMP_NUM was not found
          console.log('Employee not found');
          res.status(404).json({ error: 'Employee not found' });
        }
      }
    }
  );
});

// Define the DELETE route for deleting an employee by EMP_NUM
app.delete('/api/delete-employee/:empNum', (req, res) => {
  const empNum = req.params.empNum; // Get the employee number from the URL parameter

  // Create an SQL query to delete the employee with the specified EMP_NUM
  const query = `
    DELETE FROM EMPLOYEE
    WHERE EMP_NUM = ?
  `;

  // Execute the query with the provided EMP_NUM
  db.query(query, [empNum], (error, results) => {
    if (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Check if any rows were affected to determine if the employee was found and deleted
      if (results.affectedRows === 1) {
        console.log('Employee deleted successfully');
        res.status(200).json({ message: 'Employee deleted successfully' });
      } else {
        // No rows were affected, meaning the employee with the specified EMP_NUM was not found
        console.log('Employee not found');
        res.status(404).json({ error: 'Employee not found' });
      }
    }
  });
});

  // 10. Retrieve professors and their hire dates between 1980 and 1990
  app.get('/api/professors-hire-dates-between-1980-1990', (req, res) => {
    const query = `
      SELECT CONCAT(e.EMP_FNAME, ' ', e.EMP_LNAME, '-', e.EMP_NUM) AS Professor, DATE_FORMAT(e.EMP_HIREDATE, '%Y') as DateHired
      FROM employee e
      LEFT JOIN professor p ON e.EMP_NUM = p.EMP_NUM
      WHERE DATE_FORMAT(e.EMP_HIREDATE, '%Y') BETWEEN '1980' AND '1990'
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(results);
      }
    });
  });

 // Define the POST route for adding a new employee
 app.post('/api/add-employee', (req, res) => {
  // Extract data from the request body
  const {
    EMP_NUM,
    EMP_LNAME,
    EMP_FNAME,
    EMP_INITIAL,
    EMP_JOBCODE,
    EMP_HIREDATE,
    EMP_DOB,
  } = req.body;

  // Create an SQL query to insert the data into the EMPLOYEE table
  const query = `INSERT INTO employee (
    EMP_NUM,
    EMP_LNAME,
    EMP_FNAME,
    EMP_INITIAL,
    EMP_JOBCODE,
    EMP_HIREDATE,
    EMP_DOB
  ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  // Execute the query with the provided data
  db.query(
    query,
    [
      EMP_NUM,
      EMP_LNAME,
      EMP_FNAME,
      EMP_INITIAL,
      EMP_JOBCODE,
      EMP_HIREDATE,
      EMP_DOB,
    ],
    (error, results) => {
      if (error) {
        console.error('Error adding employee:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        console.log('Employee added successfully');
        res.status(200).json({ message: 'Employee added successfully' });
      }
    }
  );
});

// Define the PUT route for updating employee data by EMP_NUM
app.put('/api/update-employee/:empNum', (req, res) => {
  const empNum = req.params.empNum; // Get the employee number from the URL parameter

  // Extract data from the request body
  const {
    EMP_LNAME,
    EMP_FNAME,
    EMP_INITIAL,
    EMP_JOBCODE,
    EMP_HIREDATE,
    EMP_DOB,
  } = req.body;

  // Create an SQL query to update the data of the employee with the specified EMP_NUM
  const query = `
    UPDATE EMPLOYEE
    SET
      EMP_LNAME = ?,
      EMP_FNAME = ?,
      EMP_INITIAL = ?,
      EMP_JOBCODE = ?,
      EMP_HIREDATE = ?,
      EMP_DOB = ?
    WHERE EMP_NUM = ?
  `;

  // Execute the query with the provided data
  db.query(
    query,
    [
      EMP_LNAME,
      EMP_FNAME,
      EMP_INITIAL,
      EMP_JOBCODE,
      EMP_HIREDATE,
      EMP_DOB,
      empNum,
    ],
    (error, results) => {
      if (error) {
        console.error('Error updating employee data:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        // Check if any rows were affected to determine if the employee was found and updated
        if (results.affectedRows === 1) {
          console.log('Employee data updated successfully');
          res.status(200).json({ message: 'Employee data updated successfully' });
        } else {
          // No rows were affected, meaning the employee with the specified EMP_NUM was not found
          console.log('Employee not found');
          res.status(404).json({ error: 'Employee not found' });
        }
      }
    }
  );
});

// Define the DELETE route for deleting an employee by EMP_NUM
app.delete('/api/delete-employee/:empNum', (req, res) => {
  const empNum = req.params.empNum; // Get the employee number from the URL parameter

  // Create an SQL query to delete the employee with the specified EMP_NUM
  const query = `
    DELETE FROM EMPLOYEE
    WHERE EMP_NUM = ?
  `;

  // Execute the query with the provided EMP_NUM
  db.query(query, [empNum], (error, results) => {
    if (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Check if any rows were affected to determine if the employee was found and deleted
      if (results.affectedRows === 1) {
        console.log('Employee deleted successfully');
        res.status(200).json({ message: 'Employee deleted successfully' });
      } else {
        // No rows were affected, meaning the employee with the specified EMP_NUM was not found
        console.log('Employee not found');
        res.status(404).json({ error: 'Employee not found' });
      }
    }
  });
});

app.listen(PORT, () => {
    console.log("Server running....")
})
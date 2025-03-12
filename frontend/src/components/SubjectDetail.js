import React from 'react';
import { useParams } from 'react-router-dom';

function SubjectDetail() {
  const { id } = useParams(); 

  const subjects = [
    { id: 1, name: 'Math', description: 'Mathematics tests' },
    { id: 2, name: 'Physics', description: 'Physics tests' },
    { id: 3, name: 'Chemistry', description: 'Chemistry tests' },
    { id: 4, name: 'Literature', description: 'Literature tests' },
  ];

  const subject = subjects.find((subj) => subj.id === parseInt(id, 10));

  if (!subject) {
    return <div>Subject not found!</div>;
  }

  return (
    <div>
      <h1>{subject.name}</h1>
      <p>{subject.description}</p>
    </div>
  );
}

export default SubjectDetail;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TestInstructions from './TestInstructions';

function SubjectQuestions() {
  const { subjectId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [subject, setSubject] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchQuestionsAndSubject = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const questionsResponse = await fetch(`${API}/api/questions/bySubject/${subjectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!questionsResponse.ok) {
          throw new Error(`HTTP error fetching questions! status: ${questionsResponse.status}`);
        }
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData);

        const subjectResponse = await fetch(`${API}/api/subjects/${subjectId}`); 
        if (!subjectResponse.ok) {
          throw new Error(`HTTP error fetching subject! status: ${subjectResponse.status}`);
        }
        const subjectData = await subjectResponse.json();
        setSubject(subjectData); 

      } catch (error) {
        console.error("Could not fetch data:", error);
        setError('Failed to load questions and subject.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsAndSubject();
  }, [subjectId]);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!subject) {
    return <div>Subject not found.</div>; 
  }

  return (
    <div>
      <TestInstructions
        subjectName={subject.name} 
        questionCount={questions.length}
        timeLimit={45} 
      />
    </div>
  );
}

export default SubjectQuestions;
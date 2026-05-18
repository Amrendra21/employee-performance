const axios = require('axios');
const Employee = require('../models/Employee');

// @desc    Generate AI recommendation for an employee
// @route   POST /api/ai/recommend/:id
const generateRecommendation = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const overallScore = employee.overallScore;

    const prompt = `You are an expert HR consultant and performance analyst. Analyze the following employee performance data and provide detailed, actionable recommendations.

Employee Profile:
- Name: ${employee.name}
- Position: ${employee.position}
- Department: ${employee.department}
- Years of Experience: ${employee.yearsOfExperience}
- Skills: ${employee.skills.join(', ') || 'Not specified'}

Performance Metrics (out of 100):
- Overall Performance Score: ${overallScore}/100
- Performance Score: ${employee.performanceScore}/100
- Productivity: ${employee.productivity}/100
- Teamwork: ${employee.teamwork}/100
- Communication: ${employee.communication}/100
- Leadership: ${employee.leadership}/100

Based on this data, please provide:

1. **Performance Summary**: A brief assessment of the employee's current performance level.
2. **Key Strengths**: Identify 2-3 strongest areas based on the metrics.
3. **Areas for Improvement**: Identify 2-3 areas that need development.
4. **Promotion Readiness**: Rate as "Ready for Promotion", "Needs Development", or "High Priority Concern" with justification.
5. **Training Recommendations**: Suggest 3-4 specific training programs, courses, or certifications that would benefit this employee.
6. **Action Plan**: Provide 3 specific, measurable action items for the next 90 days.
7. **Career Path Suggestion**: Suggest potential career progression paths.

Format your response in a clear, professional manner suitable for an HR report.`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/free',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR consultant specializing in employee performance analysis and career development. Provide detailed, actionable, and professional recommendations.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Employee Performance Analytics',
        },
      }
    );

    const recommendation = response.data.choices[0].message.content;

    // Save recommendation to employee
    employee.aiRecommendation = recommendation;
    employee.lastRecommendationDate = new Date();
    await employee.save();

    res.json({ recommendation, employee });
  } catch (error) {
    console.error('AI recommendation error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to generate AI recommendation',
      error: error.response?.data?.error?.message || error.message,
    });
  }
};

// @desc    Generate bulk recommendations and rankings
// @route   GET /api/ai/bulk-analyze
const bulkAnalyze = async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'active' }).limit(10);

    const employeeData = employees.map(emp => ({
      name: emp.name,
      position: emp.position,
      department: emp.department,
      overallScore: emp.overallScore,
      performanceScore: emp.performanceScore,
      productivity: emp.productivity,
      teamwork: emp.teamwork,
      leadership: emp.leadership,
    }));

    const prompt = `As an HR analytics expert, analyze these ${employees.length} employees and provide:

1. **Team Rankings**: Rank all employees from highest to lowest performer with brief justification.
2. **Top Performers**: Identify top 3 employees ready for promotion/recognition.
3. **Needs Attention**: Identify employees needing immediate support/training.
4. **Team Health Summary**: Overall team performance assessment.
5. **Department-Level Insights**: Key observations about team dynamics.

Employee Data:
${JSON.stringify(employeeData, null, 2)}

Provide concise, actionable insights in a professional format.`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: 'You are an expert HR analytics consultant providing team performance insights.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1200,
        temperature: 0.6,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Employee Performance Analytics',
        },
      }
    );

    const analysis = response.data.choices[0].message.content;
    res.json({ analysis, employeeCount: employees.length });
  } catch (error) {
    console.error('Bulk analysis error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to generate bulk analysis',
      error: error.response?.data?.error?.message || error.message,
    });
  }
};

module.exports = { generateRecommendation, bulkAnalyze };

const Employee = require('../models/Employee');

// @desc    Get all employees (with search & filter)
// @route   GET /api/employees
const getEmployees = async (req, res) => {
  try {
    const { search, department, status, sortBy, order } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (department) query.department = department;
    if (status) query.status = status;

    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const employees = await Employee.find(query).sort(sortOptions);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create employee
// @route   POST /api/employees
const createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee rankings
// @route   GET /api/employees/rankings
const getEmployeeRankings = async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'active' });
    const ranked = employees
      .map(emp => ({
        _id: emp._id,
        name: emp.name,
        department: emp.department,
        position: emp.position,
        overallScore: emp.overallScore,
        performanceScore: emp.performanceScore,
        productivity: emp.productivity,
        teamwork: emp.teamwork,
        communication: emp.communication,
        leadership: emp.leadership,
      }))
      .sort((a, b) => b.overallScore - a.overallScore)
      .map((emp, index) => ({ ...emp, rank: index + 1 }));

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get department analytics
// @route   GET /api/employees/analytics
const getAnalytics = async (req, res) => {
  try {
    const departmentStats = await Employee.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          avgPerformance: { $avg: '$performanceScore' },
          avgProductivity: { $avg: '$productivity' },
          avgTeamwork: { $avg: '$teamwork' },
          avgCommunication: { $avg: '$communication' },
          avgLeadership: { $avg: '$leadership' },
          avgSalary: { $avg: '$salary' },
        },
      },
      { $sort: { avgPerformance: -1 } },
    ]);

    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const avgOverallScore = await Employee.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          avg: {
            $avg: {
              $avg: ['$performanceScore', '$productivity', '$teamwork', '$communication', '$leadership'],
            },
          },
        },
      },
    ]);

    res.json({
      totalEmployees,
      activeEmployees,
      avgOverallScore: avgOverallScore[0]?.avg?.toFixed(1) || 0,
      departmentStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeRankings,
  getAnalytics,
};

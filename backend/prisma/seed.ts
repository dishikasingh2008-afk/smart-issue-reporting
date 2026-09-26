import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Electrical', description: 'Lighting, wiring, sockets, fans and other electrical faults.' },
  { name: 'Plumbing', description: 'Water leakage, taps, pipes and drainage issues.' },
  { name: 'Furniture', description: 'Damaged chairs, desks, benches and other furniture.' },
  { name: 'Cleanliness', description: 'Garbage, dirty areas and sanitation issues.' },
  { name: 'Internet/WiFi', description: 'Network connectivity and WiFi issues.' },
  { name: 'Infrastructure', description: 'Doors, windows, walls, ceilings and structural issues.' },
  { name: 'Security', description: 'Safety and security concerns on campus.' },
  { name: 'Other', description: 'Anything that does not fit the categories above.' },
];

const SAMPLE_ISSUES: Array<{
  title: string; description: string; category: string; priority: 'LOW' | 'MEDIUM' | 'HIGH';
  building: string; floor: string; room?: string; area?: string; status: 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED';
  daysAgo: number;
}> = [
  { title: 'Water leaking from ceiling pipe', description: 'There is a major water leak from the ceiling pipe near the lab entrance, water is flooding the floor.', category: 'Plumbing', priority: 'HIGH', building: 'Academic Block A', floor: '2', area: 'Computer Lab', status: 'IN_PROGRESS', daysAgo: 2 },
  { title: 'Exposed wiring near switchboard', description: 'Exposed wiring and sparks seen near the switchboard, this is a serious electrical hazard.', category: 'Electrical', priority: 'HIGH', building: 'Academic Block B', floor: '1', room: '101', status: 'REPORTED', daysAgo: 1 },
  { title: 'Broken chair in classroom', description: 'One of the chairs in the classroom is broken and unsafe to sit on.', category: 'Furniture', priority: 'MEDIUM', building: 'Academic Block A', floor: '3', room: '305', status: 'REPORTED', daysAgo: 5 },
  { title: 'Overflowing dustbin in corridor', description: 'The dustbin near the stairs is overflowing with garbage and smells bad.', category: 'Cleanliness', priority: 'LOW', building: 'Academic Block C', floor: '1', area: 'Corridor', status: 'RESOLVED', daysAgo: 10 },
  { title: 'WiFi not working in library', description: 'The wifi network keeps disconnecting in the library reading hall.', category: 'Internet/WiFi', priority: 'MEDIUM', building: 'Library', floor: '1', area: 'Reading Hall', status: 'IN_PROGRESS', daysAgo: 3 },
  { title: 'Ceiling fan not working', description: 'The fan switch does not turn on the ceiling fan in the classroom.', category: 'Electrical', priority: 'MEDIUM', building: 'Academic Block B', floor: '2', room: '210', status: 'REPORTED', daysAgo: 4 },
  { title: 'Cracked window pane', description: 'A window pane in the hallway is cracked, cosmetic damage only.', category: 'Infrastructure', priority: 'LOW', building: 'Academic Block A', floor: '1', area: 'Hallway', status: 'RESOLVED', daysAgo: 15 },
  { title: 'Tap leaking continuously', description: 'The tap in the washroom leaks water continuously, wasting water.', category: 'Plumbing', priority: 'MEDIUM', building: 'Hostel Block 1', floor: '2', area: 'Washroom', status: 'REPORTED', daysAgo: 6 },
  { title: 'Broken table leg in library', description: 'A study table in the library has a broken leg and wobbles.', category: 'Furniture', priority: 'LOW', building: 'Library', floor: '2', area: 'Study Area', status: 'REPORTED', daysAgo: 7 },
  { title: 'Stranger loitering near hostel gate', description: 'An unidentified stranger was seen loitering near the hostel gate at night, a possible security threat.', category: 'Security', priority: 'HIGH', building: 'Hostel Block 2', floor: '0', area: 'Main Gate', status: 'IN_PROGRESS', daysAgo: 1 },
  { title: 'Dirty washroom in Block C', description: 'The washroom on the ground floor is very dirty and needs cleaning.', category: 'Cleanliness', priority: 'MEDIUM', building: 'Academic Block C', floor: '1', area: 'Washroom', status: 'REPORTED', daysAgo: 2 },
  { title: 'Internet down in computer lab', description: 'Internet connection is completely down in the computer lab, students cannot work.', category: 'Internet/WiFi', priority: 'MEDIUM', building: 'Academic Block A', floor: '2', area: 'Computer Lab', status: 'RESOLVED', daysAgo: 12 },
  { title: 'Damaged bench in garden', description: 'A wooden bench in the garden area has a broken plank, cosmetic damage.', category: 'Furniture', priority: 'LOW', building: 'Main Campus', floor: '0', area: 'Garden', status: 'RESOLVED', daysAgo: 20 },
  { title: 'Power outage in Block B', description: 'Frequent power outages happening in Block B, disrupting classes.', category: 'Electrical', priority: 'MEDIUM', building: 'Academic Block B', floor: '3', status: 'IN_PROGRESS', daysAgo: 3 },
  { title: 'Gas smell near canteen', description: 'A strong gas smell and possible leak detected near the canteen kitchen, emergency hazard.', category: 'Other', priority: 'HIGH', building: 'Canteen', floor: '0', area: 'Kitchen', status: 'REPORTED', daysAgo: 1 },
  { title: 'Dirty classroom floor', description: 'The classroom floor is dirty and has not been cleaned in days.', category: 'Cleanliness', priority: 'LOW', building: 'Academic Block A', floor: '1', room: '110', status: 'REPORTED', daysAgo: 4 },
];

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD || '1234567890!', 10);
  const studentPassword = await bcrypt.hash('Student@123', 10);
  const admin = await prisma.user.upsert({
  where: { email: process.env.ADMIN_SEED_EMAIL || 'admin@campus.com' },
  update: {},
  create: {
    name: 'Admin',
    email: process.env.ADMIN_SEED_EMAIL || 'admin@campus.com',
    password: adminPassword,
    role: 'ADMIN',
  },
});

  const student = await prisma.user.upsert({
    where: { email: 'student@campus.com' },
    update: {},
    create: { name: 'Demo Student', email: 'student@campus.com', password: studentPassword, role: 'STUDENT' },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'jane.student@campus.com' },
    update: {},
    create: { name: 'Jane Doe', email: 'jane.student@campus.com', password: studentPassword, role: 'STUDENT' },
  });

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({ where: { name: cat.name }, update: {}, create: cat });
  }

  // Clear existing issues so re-seeding is idempotent-ish for demo purposes
  await prisma.notification.deleteMany({});
  await prisma.issueStatusHistory.deleteMany({});
  await prisma.issue.deleteMany({});

  const reporters = [student, student2];

  for (let i = 0; i < SAMPLE_ISSUES.length; i++) {
    const s = SAMPLE_ISSUES[i];
    const reporter = reporters[i % reporters.length];
    const createdAt = new Date(Date.now() - s.daysAgo * 24 * 60 * 60 * 1000);
    const priorityReason = `Marked ${s.priority} priority based on rule-based analysis of the issue description.`;

    const issue = await prisma.issue.create({
      data: {
        title: s.title,
        description: s.description,
        category: s.category,
        priority: s.priority,
        priorityReason,
        status: s.status,
        building: s.building,
        floor: s.floor,
        room: s.room,
        area: s.area,
        reporterId: reporter.id,
        assignedToId: s.status !== 'REPORTED' ? admin.id : null,
        createdAt,
        updatedAt: createdAt,
        resolvedAt: s.status === 'RESOLVED' ? new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
      },
    });

    await prisma.issueStatusHistory.create({
      data: { issueId: issue.id, newStatus: 'REPORTED', changedById: reporter.id, comment: 'Issue reported by student.', createdAt },
    });

    if (s.status === 'IN_PROGRESS' || s.status === 'RESOLVED') {
      await prisma.issueStatusHistory.create({
        data: { issueId: issue.id, oldStatus: 'REPORTED', newStatus: 'IN_PROGRESS', changedById: admin.id, comment: 'Assigned to maintenance staff.', createdAt: new Date(createdAt.getTime() + 1 * 24 * 60 * 60 * 1000) },
      });
      await prisma.notification.create({
        data: { userId: reporter.id, issueId: issue.id, message: `Your issue "${issue.title}" status changed to IN PROGRESS.` },
      });
    }
    if (s.status === 'RESOLVED') {
      await prisma.issueStatusHistory.create({
        data: { issueId: issue.id, oldStatus: 'IN_PROGRESS', newStatus: 'RESOLVED', changedById: admin.id, comment: 'Issue fixed and verified.', createdAt: new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000) },
      });
      await prisma.notification.create({
        data: { userId: reporter.id, issueId: issue.id, message: `Your issue "${issue.title}" status changed to RESOLVED.` },
      });
    }
  }

  console.log('Seed complete.');
  console.log('Demo student login: student@campus.com / Student@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

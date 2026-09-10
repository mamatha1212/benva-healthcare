import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    let whereClause = {};
    if (dateParam) {
      const startDate = new Date(dateParam);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateParam);
      endDate.setHours(23, 59, 59, 999);
      whereClause = {
        date: {
          gte: startDate,
          lte: endDate,
        }
      };
    }

    const reports = await prisma.reportFile.findMany({
      where: whereClause,
      select: {
        id: true,
        date: true,
        title: true,
        fileName: true,
        patientName: true,
        patientId: true,
        mobileNumber: true,
        testName: true,
        labName: true,
        reference: true,
        remarks: true,
        needsReminder: true,
        reminderDate: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      date, title, fileName, fileUrl,
      patientName, patientId, mobileNumber,
      testName, labName, reference, remarks, needsReminder
    } = body;

    if (!date || !title || !fileName || !fileUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reportDate = new Date(date);
    let reminderDate = null;
    if (needsReminder) {
      reminderDate = new Date(reportDate);
      reminderDate.setFullYear(reminderDate.getFullYear() + 1);
    }

    const report = await prisma.reportFile.create({
      data: {
        date: reportDate,
        title,
        fileName,
        fileUrl,
        patientName,
        patientId,
        mobileNumber,
        testName,
        labName,
        reference,
        remarks,
        needsReminder: !!needsReminder,
        reminderDate
      }
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to upload report' }, { status: 500 });
  }
}

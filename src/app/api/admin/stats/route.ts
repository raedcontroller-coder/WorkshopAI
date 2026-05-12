import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Total Votes
    const totalVotes = await prisma.vote.count();

    // 2. Votes per Group (Ordered by Name naturally)
    const votesPerGroupRaw = await prisma.group.findMany({
      select: {
        name: true,
        _count: {
          select: { votes: true }
        }
      }
    });

    const naturalSort = (a: { name: string }, b: { name: string }) => {
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    };

    const votesPerGroup = votesPerGroupRaw
      .sort(naturalSort)
      .map(v => ({
        name: v.name,
        votes: v._count.votes
      }));

    // 3. Votes over Time
    const votesOverTime = await prisma.vote.findMany({
      select: { timestamp: true },
      orderBy: { timestamp: 'asc' }
    });

    // 4. Technology Stats
    const techs = await prisma.technology.findMany({
      include: {
        _count: {
          select: { groups: true }
        },
        groups: {
          select: {
            _count: {
              select: { votes: true }
            }
          }
        }
      }
    });

    const techStats = techs.map(t => {
      const totalVotesForTech = t.groups.reduce((acc, g) => acc + g._count.votes, 0);
      return {
        name: t.name,
        groupCount: t._count.groups,
        voteCount: totalVotesForTech
      };
    }).sort((a, b) => b.voteCount - a.voteCount);

    // 5. Comments grouped by Group (Ordered by Name naturally)
    const commentsByGroupRaw = await prisma.group.findMany({
      where: {
        votes: {
          some: {
            AND: [
              { comment: { not: null } },
              { comment: { not: '' } }
            ]
          }
        }
      },
      select: {
        name: true,
        votes: {
          where: {
            AND: [
              { comment: { not: null } },
              { comment: { not: '' } }
            ]
          },
          select: {
            id: true,
            comment: true,
            timestamp: true
          },
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    const commentsByGroup = commentsByGroupRaw
      .sort(naturalSort)
      .map(g => ({
        groupName: g.name,
        comments: g.votes.map(v => ({
          id: v.id,
          comment: v.comment,
          timestamp: v.timestamp
        }))
      }));

    return NextResponse.json({
      totalVotes,
      votesPerGroup,
      votesOverTime: votesOverTime.map(v => v.timestamp),
      techStats,
      commentsByGroup
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}

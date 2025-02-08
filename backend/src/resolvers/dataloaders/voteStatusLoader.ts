import DataLoader from "dataloader";
import { UserPostVotes } from "../../database/entities/UserPostVotes";

export const voteStatusLoader = () => 
  new DataLoader<{ userId: number; postId: number }, number | null>(async (keys) => {
    if (keys.length === 0) {
      return [];
    }
    const conditions = keys.map(({ userId, postId }) => `(vote.userId = ${userId} AND vote.postId = ${postId})`).join(" OR ");
    const votes = await UserPostVotes.createQueryBuilder("vote")
      .where(conditions)
      .getMany();

    const voteMap = new Map<string, number | null>();
    votes.forEach((vote) => {
      voteMap.set(`${vote.userId}-${vote.postId}`, vote.votes);
    });
    return keys.map((key) => voteMap.get(`${key.userId}-${key.postId}`) ?? null);
  });

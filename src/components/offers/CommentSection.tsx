import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getVisitorId } from "@/lib/visitor";
import { toast } from "@/lib/toast";
import { useTranslation } from "@/lib/i18n";
import { timeAgo } from "@/lib/timeAgo";

function visitorColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b", "#22c55e", "#06b6d4", "#3b82f6"];
  return colors[Math.abs(hash) % colors.length];
}

function visitorInitial(id: string): string {
  return id.slice(0, 2).toUpperCase();
}

interface Comment {
  _id: Id<"comments">;
  offerId: Id<"offers">;
  visitorId: string;
  text: string;
  parentId?: Id<"comments">;
  upvotes?: number;
  createdAt: number;
}

interface CommentSectionProps {
  offerId: Id<"offers">;
}

export function CommentSectionSkeleton() {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="w-32 h-4 skeleton mb-3" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-2">
            <div className="w-7 h-7 skeleton rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="w-24 h-3 skeleton" />
              <div className="w-full h-4 skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommentSection({ offerId }: CommentSectionProps) {
  const { t } = useTranslation();
  const comments = useQuery(api.comments.listByOffer, { offerId }) as Comment[] | undefined;
  const createComment = useMutation(api.comments.create);
  const removeComment = useMutation(api.comments.remove);
  const toggleVote = useMutation(api.commentVotes.toggleCommentVote);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Id<"comments"> | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<"top" | "new">("top");
  const visitorId = getVisitorId();

  // Group comments into top-level + replies
  const { topLevel, repliesMap } = useMemo(() => {
    if (!comments) return { topLevel: [], repliesMap: new Map<string, Comment[]>() };

    const top: Comment[] = [];
    const replies = new Map<string, Comment[]>();

    for (const c of comments) {
      if (c.parentId) {
        const arr = replies.get(c.parentId) ?? [];
        arr.push(c);
        replies.set(c.parentId, arr);
      } else {
        top.push(c);
      }
    }

    // Sort top-level
    if (sortMode === "top") {
      top.sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));
    } else {
      top.sort((a, b) => b.createdAt - a.createdAt);
    }

    return { topLevel: top, repliesMap: replies };
  }, [comments, sortMode]);

  const handlePost = async (parentId?: Id<"comments">) => {
    const content = parentId ? replyText.trim() : text.trim();
    if (!content) return;

    setPosting(true);
    try {
      await createComment({ offerId, visitorId, text: content, parentId });
      if (parentId) {
        setReplyText("");
        setReplyingTo(null);
        setExpandedReplies((prev) => new Set(prev).add(parentId));
      } else {
        setText("");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to post";
      if (msg.includes("Too many")) {
        toast(t("comments.rateLimit"), "error");
      } else {
        toast(msg, "error");
      }
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId: Id<"comments">) => {
    try {
      await removeComment({ commentId, visitorId });
    } catch {
      toast("Could not delete comment", "error");
    }
  };

  const handleUpvote = async (commentId: Id<"comments">) => {
    try {
      await toggleVote({ commentId, visitorId });
    } catch {
      // silent
    }
  };

  const formatTime = (ts: number): string => {
    const { key, n } = timeAgo(ts);
    const str = t(key as Parameters<typeof t>[0]);
    return n !== undefined ? str.replace("{n}", String(n)) : str;
  };

  const toggleRepliesExpanded = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  const renderComment = (comment: Comment, isReply = false) => {
    // Server returns truncated visitorId (first 8 chars)
    const isOwn = visitorId.startsWith(comment.visitorId);
    const replies = repliesMap.get(comment._id) ?? [];
    const isExpanded = expandedReplies.has(comment._id);

    return (
      <div key={comment._id} className={isReply ? "ml-4 pl-3 border-l border-slate-700/30" : ""}>
        <div className="flex gap-2 group">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-white mt-0.5"
            style={{ backgroundColor: visitorColor(comment.visitorId) }}
          >
            {visitorInitial(comment.visitorId)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-medium">
                {isOwn ? "You" : `#${comment.visitorId.slice(0, 6)}`}
              </span>
              <span className="text-[9px] text-slate-600">{formatTime(comment.createdAt)}</span>
              {isOwn && (
                <button
                  onClick={() => handleDelete(comment._id)}
                  className="text-[9px] text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  {t("comments.delete")}
                </button>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-0.5 break-words">{comment.text}</p>

            {/* Actions row */}
            <div className="flex items-center gap-3 mt-1">
              {/* Upvote (top-level only) */}
              {!isReply && (
                <button
                  onClick={() => handleUpvote(comment._id)}
                  className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                  {(comment.upvotes ?? 0) > 0 && <span>{comment.upvotes}</span>}
                </button>
              )}

              {/* Reply button */}
              {!isReply && (
                <button
                  onClick={() => {
                    setReplyingTo(replyingTo === comment._id ? null : comment._id);
                    setReplyText("");
                  }}
                  className="text-[10px] text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  {t("comments.reply")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reply input */}
        {replyingTo === comment._id && (
          <div className="ml-9 mt-2 flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePost(comment._id);
                }
              }}
              placeholder={t("comments.placeholder")}
              maxLength={500}
              autoFocus
              className="flex-1 bg-slate-800/50 border border-slate-700/40 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            <button
              onClick={() => handlePost(comment._id)}
              disabled={posting || !replyText.trim()}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white text-[10px] font-medium transition-all"
            >
              {t("comments.post")}
            </button>
            <button
              onClick={() => { setReplyingTo(null); setReplyText(""); }}
              className="px-2 py-1.5 text-[10px] text-slate-500 hover:text-slate-300"
            >
              {t("comments.cancel")}
            </button>
          </div>
        )}

        {/* Replies */}
        {replies.length > 0 && (
          <div className="ml-4 mt-2">
            {!isExpanded && replies.length > 3 ? (
              <>
                {replies.slice(0, 2).map((r) => renderComment(r, true))}
                <button
                  onClick={() => toggleRepliesExpanded(comment._id)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 ml-3 mt-1"
                >
                  {t("comments.showReplies").replace("{n}", String(replies.length - 2))}
                </button>
              </>
            ) : (
              <>
                {replies.map((r) => renderComment(r, true))}
                {replies.length > 3 && (
                  <button
                    onClick={() => toggleRepliesExpanded(comment._id)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 ml-3 mt-1"
                  >
                    {t("comments.hideReplies")}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {t("comments.title")}
          {comments && comments.length > 0 && (
            <span className="text-xs text-slate-500 font-normal">({comments.length})</span>
          )}
        </h3>

        {/* Sort toggle */}
        {topLevel.length > 1 && (
          <div className="flex gap-1">
            <button
              onClick={() => setSortMode("top")}
              className={`text-[10px] px-2 py-1 rounded-md transition-colors ${sortMode === "top" ? "bg-indigo-500/15 text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
            >
              {t("comments.sortByTop")}
            </button>
            <button
              onClick={() => setSortMode("new")}
              className={`text-[10px] px-2 py-1 rounded-md transition-colors ${sortMode === "new" ? "bg-indigo-500/15 text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
            >
              {t("comments.sortByNew")}
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
          style={{ backgroundColor: visitorColor(visitorId) }}
        >
          {visitorInitial(visitorId)}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handlePost();
              }
            }}
            placeholder={t("comments.placeholder")}
            maxLength={500}
            disabled={posting}
            className="flex-1 bg-slate-800/50 border border-slate-700/40 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all disabled:opacity-50"
          />
          <button
            onClick={() => handlePost()}
            disabled={posting || !text.trim()}
            className="px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-medium transition-all active:scale-95 flex-shrink-0"
          >
            {t("comments.post")}
          </button>
        </div>
      </div>

      {/* Comments list */}
      {comments === undefined ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="w-7 h-7 skeleton rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="w-24 h-3 skeleton" />
                <div className="w-full h-4 skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-3">
          {t("comments.empty")} {t("comments.beFirst")}
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {topLevel.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
}

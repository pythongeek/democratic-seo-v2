"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vote, ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function GovernancePage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newProposal, setNewProposal] = useState({ title: "", description: "", type: "feature" });

  useEffect(() => {
    fetch("/api/community/proposals?status=all")
      .then(r => r.json())
      .then(setProposals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const submitProposal = async () => {
    if (!newProposal.title.trim() || !newProposal.description.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/community/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProposal),
      });

      if (res.ok) {
        const proposal = await res.json();
        setProposals(prev => [proposal, ...prev]);
        setNewProposal({ title: "", description: "", type: "feature" });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const vote = async (id: number, voteFor: boolean) => {
    try {
      await fetch(`/api/community/proposals/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote: voteFor }),
      });

      // Refresh proposals
      const res = await fetch("/api/community/proposals?status=all");
      const data = await res.json();
      setProposals(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <Clock className="h-4 w-4 text-blue-500" />;
      case "voting": return <Vote className="h-4 w-4 text-yellow-500" />;
      case "accepted": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-500" />;
      case "implemented": return <CheckCircle className="h-4 w-4 text-primary" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-500/10 text-blue-500";
      case "voting": return "bg-yellow-500/10 text-yellow-500";
      case "accepted": return "bg-green-500/10 text-green-500";
      case "rejected": return "bg-red-500/10 text-red-500";
      case "implemented": return "bg-primary/10 text-primary";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Governance</h1>
          <p className="text-muted-foreground mt-1">
            Propose features, vote on changes, and shape the future of OpenSEO.
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Vote className="h-3 w-3" /> {proposals.filter((p: any) => p.status === "open" || p.status === "voting").length} Active
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Submit Proposal</CardTitle>
            <CardDescription>
              Propose a new feature, report a bug, or suggest governance changes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                placeholder="Short, clear title"
                value={newProposal.title}
                onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select 
                value={newProposal.type} 
                onValueChange={(v) => setNewProposal(prev => ({ ...prev, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="governance">Governance Change</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                placeholder="Detailed description with use case and expected outcome..."
                value={newProposal.description}
                onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <Button onClick={submitProposal} disabled={submitting} className="w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Vote className="h-4 w-4" />}
              Submit Proposal
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How Voting Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold">1</div>
              <p>Submit a proposal with clear description and type.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold">2</div>
              <p>Community votes for 7 days. Each user gets one vote.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold">3</div>
              <p>If quorum ({process.env.NEXT_PUBLIC_GOVERNANCE_QUORUM || 5}) reached and votesFor &gt; votesAgainst, proposal is accepted.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold">4</div>
              <p>Core team implements accepted proposals in priority order.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : proposals.length > 0 ? (
            <div className="space-y-3">
              {proposals.map((proposal: any) => (
                <div key={proposal.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(proposal.status)}
                      <h3 className="font-semibold">{proposal.title}</h3>
                      <Badge className={getStatusColor(proposal.status)}>{proposal.status}</Badge>
                      <Badge variant="outline">{proposal.type}</Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{proposal.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-green-500">
                        <ThumbsUp className="h-4 w-4" /> {proposal.votesFor}
                      </span>
                      <span className="flex items-center gap-1 text-red-500">
                        <ThumbsDown className="h-4 w-4" /> {proposal.votesAgainst}
                      </span>
                      <span className="text-muted-foreground">
                        by {proposal.author?.name || "Anonymous"}
                      </span>
                    </div>

                    {proposal.status === "open" || proposal.status === "voting" ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => vote(proposal.id, true)}>
                          <ThumbsUp className="h-3 w-3 mr-1" /> For
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => vote(proposal.id, false)}>
                          <ThumbsDown className="h-3 w-3 mr-1" /> Against
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No proposals yet. Be the first to submit one!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

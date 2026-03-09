"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Plus, X, CalendarDays } from "lucide-react";
import { DevlogListHeader } from "@/components/devlog/devlogHeader";

const API_BASE = "http://localhost:8080";
const USER_ID = "user-001";

type Post = {
  id: string;
  title: string;
  date: string;
  summary: string;
  content: string;
  tags: string[];
};

type Project = {
  id: string;
  title: string;
  tech: string;
  lastUpdated: string;
  posts: Post[];
};

type SolutionDetail = {
  id: string;
  name: string;
  projects: Project[];
};

type PostFormValue = {
  projectId: string;
  title: string;
  summary: string;
  content: string;
  tagsText: string;
};

type ApiWorkspaceDetailResponse = {
  uuid: string;
  name: string;
  mode: "personal" | "team";
  teamName: string | null;
  projects: ApiProjectDevlogGroupResponse[];
};

type ApiProjectDevlogGroupResponse = {
  id: number;
  name: string;
  description: string;
  language: string;
  lastUpdatedDate: string;
  devlogCount: number;
  posts: ApiDevlogItemResponse[];
};

type ApiDevlogItemResponse = {
  id: number;
  title: string;
  date: string;
  summary: string;
  tags: string[];
};

type ApiDevlogDetailResponse = {
  id: number;
  workspaceId: string;
  projectId: number;
  title: string;
  date: string;
  summary: string;
  content: string;
  tags: string[];
};

function formatDate(dateString: string) {
  if (!dateString) return "-";
  return dateString.replaceAll("-", ".");
}

function formatTags(tags: string[]) {
  return tags.join(", ");
}

function mapWorkspaceDetail(data: ApiWorkspaceDetailResponse): SolutionDetail {
  return {
    id: data.uuid,
    name: data.name,
    projects: data.projects.map((project) => ({
      id: String(project.id),
      title: project.name,
      tech: project.language,
      lastUpdated: formatDate(project.lastUpdatedDate),
      posts: project.posts.map((post) => ({
        id: String(post.id),
        title: post.title,
        date: post.date,
        summary: post.summary,
        content: "",
        tags: post.tags ?? [],
      })),
    })),
  };
}

export function DevlogWorkspaceView({ workspaceId }: { workspaceId: string }) {
  const [detail, setDetail] = useState<SolutionDetail | null>(null);
  const [openProjectIds, setOpenProjectIds] = useState<Record<string, boolean>>(
    {},
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<string>("");

  const [selectedPostDetail, setSelectedPostDetail] = useState<Post | null>(
    null,
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [sort, setSort] = useState<"latest" | "oldest">("latest");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projects = useMemo(() => detail?.projects ?? [], [detail]);

  const visiblePostCount = useMemo(() => {
    return projects.reduce((acc, project) => acc + project.posts.length, 0);
  }, [projects]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const reloadWorkspaceDetail = async (
    qValue = debouncedKeyword,
    sortValue = sort,
  ) => {
    const params = new URLSearchParams();

    if (qValue) {
      params.set("q", qValue);
    }
    params.set("sort", sortValue);

    const queryString = params.toString();
    const url = queryString
      ? `${API_BASE}/api/devlogs/workspaces/${workspaceId}?${queryString}`
      : `${API_BASE}/api/devlogs/workspaces/${workspaceId}`;

    const res = await fetch(url, {
      headers: {
        "X-USER-ID": USER_ID,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`워크스페이스 상세 조회 실패 (${res.status})`);
    }

    const data: ApiWorkspaceDetailResponse = await res.json();
    const mapped = mapWorkspaceDetail(data);

    setDetail(mapped);
    setOpenProjectIds((prev) => {
      const next: Record<string, boolean> = {};
      mapped.projects.forEach((project) => {
        next[project.id] = prev[project.id] ?? true;
      });
      return next;
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        await reloadWorkspaceDetail(debouncedKeyword, sort);
      } catch (err) {
        console.error(err);
        setError("개발일지 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [workspaceId, debouncedKeyword, sort]);

  const openCreateModal = () => {
    setSelectedProjectId(detail?.projects[0]?.id ?? "");
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
  };

  const closeDetailModal = () => {
    setIsDetailOpen(false);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const openDetailModal = async (projectId: string, postId: string) => {
    try {
      setDetailLoading(true);
      setSelectedProjectId(projectId);
      setSelectedPostId(postId);

      const res = await fetch(
        `${API_BASE}/api/devlogs/workspaces/${workspaceId}/projects/${projectId}/posts/${postId}`,
        {
          headers: {
            "X-USER-ID": USER_ID,
          },
          cache: "no-store",
        },
      );

      if (!res.ok) {
        throw new Error(`개발일지 상세 조회 실패 (${res.status})`);
      }

      const data: ApiDevlogDetailResponse = await res.json();

      setSelectedPostDetail({
        id: String(data.id),
        title: data.title,
        date: data.date,
        summary: data.summary,
        content: data.content,
        tags: data.tags ?? [],
      });

      setIsDetailOpen(true);
    } catch (err) {
      console.error(err);
      alert("개발일지 상세를 불러오지 못했습니다.");
    } finally {
      setDetailLoading(false);
    }
  };

  const openEditModal = () => {
    setIsDetailOpen(false);
    setIsEditOpen(true);
  };

  const handleCreate = async (value: PostFormValue) => {
    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/api/devlogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-USER-ID": USER_ID,
        },
        body: JSON.stringify({
          workspaceId,
          projectId: Number(value.projectId),
          title: value.title.trim(),
          summary: value.summary.trim(),
          content: value.content.trim(),
          tagsText: value.tagsText.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(`개발일지 작성 실패 (${res.status})`);
      }

      await reloadWorkspaceDetail();
      setOpenProjectIds((prev) => ({
        ...prev,
        [value.projectId]: true,
      }));
      setIsCreateOpen(false);
    } catch (err) {
      console.error(err);
      alert("개발일지 작성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (value: PostFormValue) => {
    if (!selectedPostDetail) return;

    try {
      setSubmitting(true);

      const res = await fetch(
        `${API_BASE}/api/devlogs/${selectedPostDetail.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-USER-ID": USER_ID,
          },
          body: JSON.stringify({
            workspaceId,
            projectId: Number(value.projectId),
            title: value.title.trim(),
            summary: value.summary.trim(),
            content: value.content.trim(),
            tagsText: value.tagsText.trim(),
          }),
        },
      );

      if (!res.ok) {
        throw new Error(`개발일지 수정 실패 (${res.status})`);
      }

      await reloadWorkspaceDetail();
      setSelectedProjectId(value.projectId);
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
      alert("개발일지 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPostDetail) return;
    if (!confirm("이 개발일지를 삭제할까요?")) return;

    try {
      setSubmitting(true);

      const res = await fetch(
        `${API_BASE}/api/devlogs/${selectedPostDetail.id}?workspaceId=${workspaceId}&projectId=${selectedProjectId}`,
        {
          method: "DELETE",
          headers: {
            "X-USER-ID": USER_ID,
          },
        },
      );

      if (!res.ok) {
        throw new Error(`개발일지 삭제 실패 (${res.status})`);
      }

      await reloadWorkspaceDetail();
      setIsDetailOpen(false);
      setSelectedPostDetail(null);
      setSelectedPostId("");
    } catch (err) {
      console.error(err);
      alert("개발일지 삭제에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-500">
        개발일지 목록을 불러오는 중입니다...
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-500">
        {error ?? "존재하지 않는 워크스페이스입니다."}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            개발일지
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{detail.name}</span> ·
            프로젝트별 개발일지를 확인합니다
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={16} />새 일지 작성
        </button>
      </div>

      <DevlogListHeader
        keyword={keyword}
        sort={sort}
        onKeywordChange={setKeyword}
        onSortChange={setSort}
      />

      <div className="text-sm text-gray-500">
        검색 결과{" "}
        <span className="font-semibold text-gray-800">{visiblePostCount}</span>
        개
      </div>

      <section className="space-y-4">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-500">
            검색 결과가 없습니다.
          </div>
        ) : (
          projects.map((project) => {
            const isOpen = openProjectIds[project.id] ?? true;

            return (
              <div
                key={project.id}
                className="rounded-2xl border border-gray-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenProjectIds((prev) => ({
                      ...prev,
                      [project.id]: !isOpen,
                    }))
                  }
                  className="w-full rounded-2xl px-5 py-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-sm font-bold text-gray-900">
                          {project.title}
                        </div>
                        <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                          {project.tech}
                        </span>
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        최근 수정 날짜:{" "}
                        <span className="font-semibold text-gray-800">
                          {project.lastUpdated}
                        </span>
                        <span className="mx-2 text-gray-300">·</span>
                        개발일지 {project.posts.length}개
                      </div>
                    </div>

                    {isOpen ? (
                      <ChevronDown size={20} className="text-gray-700" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-700" />
                    )}
                  </div>
                </button>

                {isOpen ? (
                  <div className="px-5 pb-5 pt-1">
                    {project.posts.length === 0 ? (
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-500">
                        개발일지가 없습니다.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {project.posts.map((post) => (
                          <button
                            key={post.id}
                            type="button"
                            onClick={() => openDetailModal(project.id, post.id)}
                            className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-gray-300 hover:shadow-sm"
                          >
                            <div className="space-y-2">
                              <div className="text-xs text-gray-500">
                                {post.date}
                              </div>

                              <div className="font-extrabold text-gray-900">
                                {post.title}
                              </div>

                              <div className="text-sm text-gray-600">
                                {post.summary}
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {post.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </section>

      {isCreateOpen ? (
        <PostFormModal
          title="새 개발일지 작성"
          subtitle="오늘의 개발 내용을 기록하세요"
          projects={projects.map((project) => ({
            id: project.id,
            title: project.title,
          }))}
          initialValue={{
            projectId: selectedProjectId || projects[0]?.id || "",
            title: "",
            summary: "",
            content: "",
            tagsText: "",
          }}
          submitLabel={submitting ? "저장 중..." : "저장"}
          onClose={closeCreateModal}
          onSubmit={handleCreate}
        />
      ) : null}

      {isDetailOpen && selectedPostDetail ? (
        <PostDetailModal
          post={selectedPostDetail}
          onClose={closeDetailModal}
          onEdit={openEditModal}
          onDelete={handleDelete}
          loading={detailLoading || submitting}
        />
      ) : null}

      {isEditOpen && selectedPostDetail ? (
        <PostFormModal
          title="개발일지 수정"
          subtitle="일지 내용을 수정하세요"
          projects={projects.map((project) => ({
            id: project.id,
            title: project.title,
          }))}
          initialValue={{
            projectId: selectedProjectId,
            title: selectedPostDetail.title,
            summary: selectedPostDetail.summary,
            content: selectedPostDetail.content,
            tagsText: formatTags(selectedPostDetail.tags),
          }}
          submitLabel={submitting ? "저장 중..." : "저장"}
          onClose={closeEditModal}
          onSubmit={handleEdit}
        />
      ) : null}
    </>
  );
}

function ModalShell({
  title,
  subtitle,
  children,
  footer,
  onClose,
  maxWidth = "max-w-[680px]",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/35">
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div
          className={[
            "w-full",
            maxWidth,
            "max-h-[85vh]",
            "flex flex-col",
            "overflow-hidden",
            "rounded-[18px] border border-[#E5E7EB] bg-white",
            "shadow-[0_18px_48px_rgba(15,23,42,0.16)]",
          ].join(" ")}
        >
          <div className="shrink-0 flex items-start justify-between border-b border-[#ECEEF2] px-5 py-4">
            <div>
              <h2 className="text-[24px] font-extrabold leading-none tracking-[-0.02em] text-[#111827]">
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-2 text-[14px] leading-5 text-[#6B7280]">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
            >
              <X size={17} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {children}
          </div>

          {footer ? (
            <div className="shrink-0 flex justify-end gap-2 border-t border-[#ECEEF2] bg-white px-5 py-3">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PostDetailModal({
  post,
  onClose,
  onEdit,
  onDelete,
  loading,
}: {
  post: Post;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  loading?: boolean;
}) {
  return (
    <ModalShell
      title="개발일지 상세"
      onClose={onClose}
      maxWidth="max-w-[760px]"
      footer={
        <>
          <button
            type="button"
            onClick={onEdit}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
          >
            수정
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#F3D1D1] bg-white px-4 text-sm font-semibold text-[#EF4444] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            삭제
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <section>
          <div className="text-sm font-medium text-[#9CA3AF]">제목</div>
          <div className="mt-2 text-[20px] font-extrabold leading-7 tracking-[-0.01em] text-[#111827]">
            {post.title}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 border-b border-[#ECEEF2] pb-5 sm:grid-cols-2">
          <div>
            <div className="text-sm font-medium text-[#9CA3AF]">작성일</div>
            <div className="mt-2 flex items-center gap-2 text-[15px] font-medium text-[#111827]">
              <CalendarDays size={16} className="text-[#6B7280]" />
              <span>{post.date}</span>
            </div>
          </div>
        </section>

        <section>
          <div className="text-sm font-medium text-[#9CA3AF]">요약</div>
          <div className="mt-2 text-[15px] leading-7 text-[#374151]">
            {post.summary}
          </div>
        </section>

        <section>
          <div className="text-sm font-medium text-[#9CA3AF]">내용</div>
          <div className="mt-3 rounded-2xl bg-[#FAFAFB] px-4 py-4 text-[15px] leading-7 text-[#111827]">
            <pre className="whitespace-pre-wrap font-sans">
              {post.content || "-"}
            </pre>
          </div>
        </section>

        {post.tags.length > 0 ? (
          <section>
            <div className="mb-3 text-sm font-medium text-[#9CA3AF]">태그</div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-[11px] font-semibold text-[#374151]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </ModalShell>
  );
}

function PostFormModal({
  title,
  subtitle,
  projects,
  initialValue,
  submitLabel,
  onClose,
  onSubmit,
}: {
  title: string;
  subtitle?: string;
  projects: Array<{ id: string; title: string }>;
  initialValue: PostFormValue;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (value: PostFormValue) => void;
}) {
  const [value, setValue] = useState<PostFormValue>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const canSave =
    !!value.projectId.trim() &&
    !!value.title.trim() &&
    !!value.summary.trim() &&
    !!value.content.trim();

  return (
    <ModalShell
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      maxWidth="max-w-[640px]"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onSubmit(value)}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white transition hover:bg-[#0B1220] disabled:cursor-not-allowed disabled:bg-[#9CA3AF]"
          >
            {submitLabel}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <FieldLabel required>프로젝트</FieldLabel>
          <select
            value={value.projectId}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, projectId: e.target.value }))
            }
            className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F7FA] px-4 text-sm text-[#111827] outline-none transition focus:border-[#D1D5DB] focus:bg-white focus:ring-2 focus:ring-[#E5E7EB]"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel required>제목</FieldLabel>
          <input
            value={value.title}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="예: 사용자 인증 기능 구현"
            className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F7FA] px-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#D1D5DB] focus:bg-white focus:ring-2 focus:ring-[#E5E7EB]"
          />
        </div>

        <div>
          <FieldLabel required>요약</FieldLabel>
          <input
            value={value.summary}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, summary: e.target.value }))
            }
            placeholder="한 줄로 요약해주세요"
            className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F7FA] px-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#D1D5DB] focus:bg-white focus:ring-2 focus:ring-[#E5E7EB]"
          />
        </div>

        <div>
          <FieldLabel required>상세 내용</FieldLabel>
          <textarea
            value={value.content}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, content: e.target.value }))
            }
            placeholder="작업 내용, 주요 변경사항, 이슈 및 해결방법, 다음 단계 등을 작성하세요..."
            className="min-h-[120px] w-full rounded-xl border border-[#E5E7EB] bg-[#F7F7FA] px-4 py-3 text-sm leading-6 text-[#111827] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#D1D5DB] focus:bg-white focus:ring-2 focus:ring-[#E5E7EB]"
          />
          <div className="mt-2 text-xs text-[#9CA3AF]">
            {value.content.length} / 5000자
          </div>
        </div>

        <div>
          <FieldLabel>태그</FieldLabel>
          <input
            value={value.tagsText}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, tagsText: e.target.value }))
            }
            placeholder="예: API, Design, UI/UX"
            className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F7F7FA] px-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#D1D5DB] focus:bg-white focus:ring-2 focus:ring-[#E5E7EB]"
          />
        </div>
      </div>
    </ModalShell>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-[#111827]">
      {children}
      {required ? <span className="ml-1 text-[#111827]">*</span> : null}
    </label>
  );
}

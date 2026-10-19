import { notFound } from "next/navigation";
import { getUiLang } from "@/lib/i18n/server-lang";
import { courseHref, findLessonIn } from "@/lib/learn/courses";
import { tryItCodeOf, tryItModeOf } from "@/lib/learn/util";
import { TryItEditor } from "@/components/learn/try-it-editor";

type Params = Promise<{ course: string; lesson: string; n: string }>;

function findExample(p: { course: string; lesson: string; n: string }) {
  const found = findLessonIn(p.course, p.lesson);
  if (!found || !found.course.tutorial) return null;
  const blocks = found.ref.lesson.blocks;
  const index = Number(p.n);
  const block = blocks[index];
  const mode = block && tryItModeOf(block);
  const code = block && tryItCodeOf(block);
  if (!block || (block.t !== "code" && block.t !== "multicode") || !mode || code === undefined) return null;
  const runnable = blocks.flatMap((b, i) => (tryItModeOf(b) ? [i] : []));
  return { ...found, block, code, mode, index, runnable };
}

export async function generateMetadata({ params }: { params: Params }) {
  const ex = findExample(await params);
  return { title: ex ? `Try it: ${ex.block.title ?? ex.ref.lesson.title} – ${ex.course.short}` : "Try it Yourself" };
}

/** W3Schools-style "Try it Yourself" page: edit an example on the left, see the live result on the right. */
export default async function TryItPage({ params }: { params: Params }) {
  const p = await params;
  const ex = findExample(p);
  if (!ex) notFound();
  const lang = await getUiLang();
  const lessonHref = `${courseHref(ex.course)}/${ex.ref.slug}`;
  const pos = ex.runnable.indexOf(ex.index);
  const href = (i: number | undefined) => (i === undefined ? undefined : `${lessonHref}/tryit/${i}`);

  return (
    <TryItEditor
      key={`${ex.ref.slug}-${ex.index}`}
      initialCode={ex.code}
      mode={ex.mode}
      title={ex.block.title ?? ex.ref.lesson.title}
      position={`${ex.ref.lesson.title} · ${lang === "hi" ? "उदाहरण" : "example"} ${pos + 1} / ${ex.runnable.length}`}
      backHref={lessonHref}
      prevHref={href(ex.runnable[pos - 1])}
      nextHref={href(ex.runnable[pos + 1])}
      lang={lang}
    />
  );
}

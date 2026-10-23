import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";

export type Spec = {
  id: string;
  editionId: string;
  groupName: string;
  specName: string;
  specValue: string;
};

export type OptionRow = {
  id: string;
  editionId: string;
  code: string;
  name: string;
  description: string;
};

export type Edition = {
  id: string;
  milestoneId: string;
  name: string;
  image: string;
  specs: Spec[];
  options: OptionRow[];
};

export type Milestone = {
  id: string;
  versionId: string;
  label: string;
  happenedOn: string;
  note: string;
  editions: Edition[];
};

export type Version = {
  id: string;
  modelId: string;
  name: string;
  slug: string;
  summary: string;
  swatch: string;
  heroImage: string;
  milestones: Milestone[];
};

export type Model = {
  id: string;
  lineId: string;
  name: string;
  slug: string;
  tagline: string;
  heroImage: string;
  versions: Version[];
};

export type Line = {
  id: string;
  name: string;
  slug: string;
  blurb: string;
  models: Model[];
};

export type Catalog = { lines: Line[] };

function slugify(value: string) {
  const base = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || "muc";
}

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export const getCatalog = createServerFn({ method: "GET" }).handler(async (): Promise<Catalog> => {
  const sql = await getSql();
  const lines = await sql<{ id: string; name: string; slug: string; blurb: string }>`
    select id, name, slug, blurb from lines order by sort_order, name`;
  const models = await sql<{
    id: string;
    line_id: string;
    name: string;
    slug: string;
    tagline: string;
    hero_image: string;
  }>`select id, line_id, name, slug, tagline, hero_image from models order by sort_order, name`;
  const versions = await sql<{
    id: string;
    model_id: string;
    name: string;
    slug: string;
    summary: string;
    swatch: string;
    hero_image: string;
  }>`select id, model_id, name, slug, summary, swatch, hero_image from versions order by sort_order, name`;
  const milestones = await sql<{
    id: string;
    version_id: string;
    label: string;
    happened_on: string;
    note: string;
  }>`select id, version_id, label, happened_on::text as happened_on, note from milestones order by happened_on, sort_order`;
  const editions = await sql<{
    id: string;
    milestone_id: string;
    name: string;
    image: string;
  }>`select id, milestone_id, name, image from editions order by sort_order, name`;
  const specs = await sql<{
    id: string;
    edition_id: string;
    group_name: string;
    spec_name: string;
    spec_value: string;
  }>`select es.id, es.edition_id, f.group_name, f.name as spec_name, c.label as spec_value
    from edition_specs es
    join spec_fields f on f.id = es.field_id
    join spec_choices c on c.id = es.choice_id
    order by f.sort_order, f.name`;
  const options = await sql<{
    id: string;
    edition_id: string;
    code: string;
    name: string;
    description: string;
  }>`select eo.id, eo.edition_id, c.code, c.name, c.description
    from edition_options eo
    join option_catalog c on c.id = eo.option_id
    order by eo.sort_order, c.code`;

  const specsBy = new Map<string, Spec[]>();
  for (const row of specs) {
    const list = specsBy.get(row.edition_id) ?? [];
    list.push({
      id: row.id,
      editionId: row.edition_id,
      groupName: row.group_name,
      specName: row.spec_name,
      specValue: row.spec_value,
    });
    specsBy.set(row.edition_id, list);
  }
  const optionsBy = new Map<string, OptionRow[]>();
  for (const row of options) {
    const list = optionsBy.get(row.edition_id) ?? [];
    list.push({
      id: row.id,
      editionId: row.edition_id,
      code: row.code,
      name: row.name,
      description: row.description,
    });
    optionsBy.set(row.edition_id, list);
  }
  const editionsBy = new Map<string, Edition[]>();
  for (const row of editions) {
    const list = editionsBy.get(row.milestone_id) ?? [];
    list.push({
      id: row.id,
      milestoneId: row.milestone_id,
      name: row.name,
      image: row.image,
      specs: specsBy.get(row.id) ?? [],
      options: optionsBy.get(row.id) ?? [],
    });
    editionsBy.set(row.milestone_id, list);
  }
  const milesBy = new Map<string, Milestone[]>();
  for (const row of milestones) {
    const list = milesBy.get(row.version_id) ?? [];
    list.push({
      id: row.id,
      versionId: row.version_id,
      label: row.label,
      happenedOn: row.happened_on,
      note: row.note,
      editions: editionsBy.get(row.id) ?? [],
    });
    milesBy.set(row.version_id, list);
  }
  const versionsBy = new Map<string, Version[]>();
  for (const row of versions) {
    const list = versionsBy.get(row.model_id) ?? [];
    list.push({
      id: row.id,
      modelId: row.model_id,
      name: row.name,
      slug: row.slug,
      summary: row.summary,
      swatch: row.swatch,
      heroImage: row.hero_image,
      milestones: milesBy.get(row.id) ?? [],
    });
    versionsBy.set(row.model_id, list);
  }
  const modelsBy = new Map<string, Model[]>();
  for (const row of models) {
    const list = modelsBy.get(row.line_id) ?? [];
    list.push({
      id: row.id,
      lineId: row.line_id,
      name: row.name,
      slug: row.slug,
      tagline: row.tagline,
      heroImage: row.hero_image,
      versions: versionsBy.get(row.id) ?? [],
    });
    modelsBy.set(row.line_id, list);
  }

  return {
    lines: lines.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      blurb: row.blurb,
      models: modelsBy.get(row.id) ?? [],
    })),
  };
});

const imageField = z.string().max(1_200_000);
const ADMIN_KEY = "admin123";

function assertAdmin(key: string) {
  if (key !== ADMIN_KEY) throw new Error("Chỉ quản trị mới nhập liệu được.");
}

export const checkAdmin = createServerFn({ method: "POST" })
  .validator(z.object({ adminKey: z.string() }))
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    return { ok: true as const };
  });


export const saveLine = createServerFn({ method: "POST" })
  .validator(
    z.object({
      adminKey: z.string(),
      id: z.string().optional(),
      name: z.string().min(1).max(80),
      blurb: z.string().max(400).default(""),
    }),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    const sql = await getSql();
    if (data.id) {
      await sql`update lines set name = ${data.name}, blurb = ${data.blurb} where id = ${data.id}`;
      return { id: data.id };
    }
    const id = uid("ln");
    const slug = `${slugify(data.name)}-${id.slice(-4)}`;
    await sql`insert into lines (id, name, slug, blurb, sort_order)
      values (${id}, ${data.name}, ${slug}, ${data.blurb}, 50)`;
    return { id };
  });

export const saveModel = createServerFn({ method: "POST" })
  .validator(
    z.object({
      adminKey: z.string(),
      id: z.string().optional(),
      lineId: z.string().min(1),
      name: z.string().min(1).max(80),
      tagline: z.string().max(240).default(""),
      heroImage: imageField.default(""),
    }),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    const sql = await getSql();
    if (data.id) {
      await sql`update models set name = ${data.name}, tagline = ${data.tagline}, hero_image = ${data.heroImage}, line_id = ${data.lineId} where id = ${data.id}`;
      return { id: data.id };
    }
    const id = uid("md");
    const slug = `${slugify(data.name)}-${id.slice(-4)}`;
    await sql`insert into models (id, line_id, name, slug, tagline, hero_image, sort_order)
      values (${id}, ${data.lineId}, ${data.name}, ${slug}, ${data.tagline}, ${data.heroImage}, 50)`;
    return { id };
  });

export const saveVersion = createServerFn({ method: "POST" })
  .validator(
    z.object({
      adminKey: z.string(),
      id: z.string().optional(),
      modelId: z.string().min(1),
      name: z.string().min(1).max(80),
      summary: z.string().max(500).default(""),
      swatch: z.string().max(20).default("#161513"),
      heroImage: imageField.default(""),
    }),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    const sql = await getSql();
    if (data.id) {
      await sql`update versions set name = ${data.name}, summary = ${data.summary}, swatch = ${data.swatch}, hero_image = ${data.heroImage}, model_id = ${data.modelId} where id = ${data.id}`;
      return { id: data.id };
    }
    const id = uid("vr");
    const slug = `${slugify(data.name)}-${id.slice(-4)}`;
    await sql`insert into versions (id, model_id, name, slug, summary, swatch, hero_image, sort_order)
      values (${id}, ${data.modelId}, ${data.name}, ${slug}, ${data.summary}, ${data.swatch}, ${data.heroImage}, 50)`;
    return { id };
  });

export const saveMilestone = createServerFn({ method: "POST" })
  .validator(
    z.object({
      adminKey: z.string(),
      id: z.string().optional(),
      versionId: z.string().min(1),
      label: z.string().min(1).max(80),
      happenedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      note: z.string().max(400).default(""),
    }),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    const sql = await getSql();
    if (data.id) {
      await sql`update milestones set label = ${data.label}, happened_on = ${data.happenedOn}, note = ${data.note} where id = ${data.id}`;
      return { id: data.id };
    }
    const id = uid("ms");
    await sql`insert into milestones (id, version_id, label, happened_on, note, sort_order)
      values (${id}, ${data.versionId}, ${data.label}, ${data.happenedOn}, ${data.note}, 50)`;
    return { id };
  });

export const saveEdition = createServerFn({ method: "POST" })
  .validator(
    z.object({
      adminKey: z.string(),
      id: z.string().optional(),
      milestoneId: z.string().min(1),
      name: z.string().min(1).max(120),
      image: imageField.default(""),
    }),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    const sql = await getSql();
    if (data.id) {
      await sql`update editions set name = ${data.name}, image = ${data.image} where id = ${data.id}`;
      return { id: data.id };
    }
    const id = uid("ed");
    await sql`insert into editions (id, milestone_id, name, image, sort_order)
      values (${id}, ${data.milestoneId}, ${data.name}, ${data.image}, 50)`;
    return { id };
  });

export const saveSpec = createServerFn({ method: "POST" })
  .validator(
    z.object({
      adminKey: z.string(),
      id: z.string().optional(),
      editionId: z.string().min(1),
      groupName: z.string().max(80).default(""),
      specName: z.string().min(1).max(120),
      specValue: z.string().max(240).default(""),
    }),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    const sql = await getSql();
    if (data.id) {
      await sql`update specs set group_name = ${data.groupName}, spec_name = ${data.specName}, spec_value = ${data.specValue} where id = ${data.id}`;
      return { id: data.id };
    }
    const id = uid("sp");
    await sql`insert into specs (id, edition_id, group_name, spec_name, spec_value, sort_order)
      values (${id}, ${data.editionId}, ${data.groupName}, ${data.specName}, ${data.specValue}, 50)`;
    return { id };
  });

export const saveOption = createServerFn({ method: "POST" })
  .validator(
    z.object({
      adminKey: z.string(),
      id: z.string().optional(),
      editionId: z.string().min(1),
      name: z.string().min(1).max(120),
      description: z.string().max(500).default(""),
    }),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    const sql = await getSql();
    if (data.id) {
      await sql`update options set name = ${data.name}, description = ${data.description} where id = ${data.id}`;
      return { id: data.id };
    }
    const id = uid("op");
    await sql`insert into options (id, edition_id, name, description, sort_order)
      values (${id}, ${data.editionId}, ${data.name}, ${data.description}, 50)`;
    return { id };
  });

export type SpecChoice = { id: string; label: string };
export type SpecField = { id: string; groupName: string; name: string; choices: SpecChoice[] };
export type CatalogOption = { id: string; code: string; name: string; description: string };
export type Library = { fields: SpecField[]; options: CatalogOption[] };

export const getLibrary = createServerFn({ method: "GET" }).handler(async (): Promise<Library> => {
  const sql = await getSql();
  const fields = await sql<{ id: string; group_name: string; name: string }>`
    select id, group_name, name from spec_fields order by sort_order, name`;
  const choices = await sql<{ id: string; field_id: string; label: string }>`
    select id, field_id, label from spec_choices order by sort_order, label`;
  const options = await sql<{ id: string; code: string; name: string; description: string }>`
    select id, code, name, description from option_catalog order by code`;
  return {
    fields: fields.map((field) => ({
      id: field.id,
      groupName: field.group_name,
      name: field.name,
      choices: choices
        .filter((choice) => choice.field_id === field.id)
        .map((choice) => ({ id: choice.id, label: choice.label })),
    })),
    options: options.map((option) => ({
      id: option.id,
      code: option.code,
      name: option.name,
      description: option.description,
    })),
  };
});

export const saveSpecField = createServerFn({ method: "POST" })
  .validator(
    z.object({
      adminKey: z.string(),
      groupName: z.string().max(80).default(""),
      name: z.string().min(1).max(120),
    }),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    const sql = await getSql();
    const id = uid("sf");
    await sql`insert into spec_fields (id, group_name, name, sort_order) values (${id}, ${data.groupName}, ${data.name}, 50)`;
    return { id };
  });

export const saveSpecChoice = createServerFn({ method: "POST" })
  .validator(
    z.object({
      adminKey: z.string(),
      fieldId: z.string().min(1),
      label: z.string().min(1).max(160),
    }),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    const sql = await getSql();
    const taken = await sql<{ id: string }>`
      select id from spec_choices where field_id = ${data.fieldId} and label = ${data.label}`;
    if (taken[0]) throw new Error("Giá trị này đã có.");
    const id = uid("sc");
    await sql`insert into spec_choices (id, field_id, label, sort_order) values (${id}, ${data.fieldId}, ${data.label}, 50)`;
    return { id };
  });

export const assignSpec = createServerFn({ method: "POST" })
  .validator(
    z.object({
      adminKey: z.string(),
      editionId: z.string().min(1),
      fieldId: z.string().min(1),
      choiceId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    const sql = await getSql();
    const existing = await sql<{ id: string }>`
      select id from edition_specs where edition_id = ${data.editionId} and field_id = ${data.fieldId}`;
    if (existing[0]) {
      await sql`update edition_specs set choice_id = ${data.choiceId} where id = ${existing[0].id}`;
      return { id: existing[0].id };
    }
    const id = uid("es");
    await sql`insert into edition_specs (id, edition_id, field_id, choice_id) values (${id}, ${data.editionId}, ${data.fieldId}, ${data.choiceId})`;
    return { id };
  });

export const saveCatalogOption = createServerFn({ method: "POST" })
  .validator(
    z.object({
      adminKey: z.string(),
      code: z.string().min(1).max(40),
      name: z.string().min(1).max(120),
      description: z.string().max(500).default(""),
    }),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    const sql = await getSql();
    const code = data.code.trim().toUpperCase();
    const taken = await sql<{ id: string }>`select id from option_catalog where code = ${code}`;
    if (taken[0]) throw new Error("Mã option này đã có.");
    const id = uid("oc");
    await sql`insert into option_catalog (id, code, name, description) values (${id}, ${code}, ${data.name}, ${data.description})`;
    return { id };
  });

export const assignOption = createServerFn({ method: "POST" })
  .validator(
    z.object({
      adminKey: z.string(),
      editionId: z.string().min(1),
      optionId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    const sql = await getSql();
    const existing = await sql<{ id: string }>`
      select id from edition_options where edition_id = ${data.editionId} and option_id = ${data.optionId}`;
    if (existing[0]) return { id: existing[0].id };
    const id = uid("eo");
    await sql`insert into edition_options (id, edition_id, option_id, sort_order) values (${id}, ${data.editionId}, ${data.optionId}, 50)`;
    return { id };
  });

const tableName = z.enum([
  "lines",
  "models",
  "versions",
  "milestones",
  "editions",
  "specs",
  "options",
  "posts",
  "spec_fields",
  "spec_choices",
  "edition_specs",
  "option_catalog",
  "edition_options",
  "tags",
]);

export const removeRow = createServerFn({ method: "POST" })
  .validator(z.object({ adminKey: z.string(), table: tableName, id: z.string().min(1).max(40) }))
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    const sql = await getSql();
    const id = data.id;
    if (data.table === "lines") await sql`delete from lines where id = ${id}`;
    else if (data.table === "models") await sql`delete from models where id = ${id}`;
    else if (data.table === "versions") await sql`delete from versions where id = ${id}`;
    else if (data.table === "milestones") await sql`delete from milestones where id = ${id}`;
    else if (data.table === "editions") await sql`delete from editions where id = ${id}`;
    else if (data.table === "specs") await sql`delete from specs where id = ${id}`;
    else if (data.table === "posts") await sql`delete from posts where id = ${id}`;
    else if (data.table === "spec_fields") await sql`delete from spec_fields where id = ${id}`;
    else if (data.table === "spec_choices") await sql`delete from spec_choices where id = ${id}`;
    else if (data.table === "edition_specs") await sql`delete from edition_specs where id = ${id}`;
    else if (data.table === "option_catalog") await sql`delete from option_catalog where id = ${id}`;
    else if (data.table === "edition_options") await sql`delete from edition_options where id = ${id}`;
    else if (data.table === "tags") await sql`delete from tags where id = ${id}`;
    else await sql`delete from options where id = ${id}`;
    return { ok: true };
  });

export type Tag = {
  id: string;
  name: string;
  slug: string;
  kind: "news" | "tech" | "blog";
};

export type Post = {
  id: string;
  kind: "news" | "tech" | "blog";
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover: string;
  author: string;
  publishedOn: string;
  tags: Tag[];
};

export const getPosts = createServerFn({ method: "GET" })
  .validator(z.object({ kind: z.enum(["news", "tech", "blog"]).optional() }).optional())
  .handler(async ({ data }): Promise<Post[]> => {
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      kind: "news" | "tech" | "blog";
      slug: string;
      title: string;
      excerpt: string;
      body: string;
      cover: string;
      author: string;
      published_on: string;
    }>`select id, kind, slug, title, excerpt, body, cover, author, published_on::text as published_on
       from posts order by published_on desc, title`;
    const tagRows = await sql<{
      post_id: string;
      id: string;
      name: string;
      slug: string;
      kind: "news" | "tech" | "blog";
    }>`select pt.post_id, t.id, t.name, t.slug, t.kind
       from post_tags pt
       join tags t on t.id = pt.tag_id
       order by t.name`;
    const tagsBy = new Map<string, Tag[]>();
    for (const row of tagRows) {
      const list = tagsBy.get(row.post_id) ?? [];
      list.push({ id: row.id, name: row.name, slug: row.slug, kind: row.kind });
      tagsBy.set(row.post_id, list);
    }
    const list = rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      body: row.body,
      cover: row.cover,
      author: row.author,
      publishedOn: row.published_on,
      tags: tagsBy.get(row.id) ?? [],
    }));
    if (!data?.kind) return list;
    return list.filter((post) => post.kind === data.kind || post.tags.some((tag) => tag.kind === data.kind));
  });

export const getTags = createServerFn({ method: "GET" }).handler(async (): Promise<Tag[]> => {
  const sql = await getSql();
  const rows = await sql<{ id: string; name: string; slug: string; kind: "news" | "tech" | "blog" }>`
    select id, name, slug, kind from tags order by kind, name`;
  return rows;
});

export const saveTag = createServerFn({ method: "POST" })
  .validator(
    z.object({
      adminKey: z.string(),
      name: z.string().min(1).max(80),
      kind: z.enum(["news", "tech", "blog"]),
    }),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    const sql = await getSql();
    const id = uid("tg");
    const slug = `${slugify(data.name)}-${id.slice(-4)}`;
    await sql`insert into tags (id, name, slug, kind) values (${id}, ${data.name}, ${slug}, ${data.kind})`;
    return { id };
  });

export const savePost = createServerFn({ method: "POST" })
  .validator(
    z.object({
      adminKey: z.string(),
      tagIds: z.array(z.string().min(1)).min(1),
      title: z.string().min(1).max(160),
      excerpt: z.string().max(400).default(""),
      body: z.string().max(8000).default(""),
      cover: imageField.default(""),
      author: z.string().max(80).default(""),
    }),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.adminKey);
    const sql = await getSql();
    const known = await sql<{ id: string; kind: "news" | "tech" | "blog" }>`select id, kind from tags`;
    const picked = known.filter((tag) => data.tagIds.includes(tag.id));
    if (picked.length === 0) throw new Error("Chọn ít nhất một thẻ.");
    const kind = picked[0].kind;
    const id = uid("ps");
    const slug = `${slugify(data.title)}-${id.slice(-4)}`;
    await sql`insert into posts (id, kind, slug, title, excerpt, body, cover, author, published_on)
      values (${id}, ${kind}, ${slug}, ${data.title}, ${data.excerpt}, ${data.body}, ${data.cover}, ${data.author}, current_date)`;
    for (const tag of picked) {
      await sql`insert into post_tags (post_id, tag_id) values (${id}, ${tag.id})`;
    }
    return { id };
  });


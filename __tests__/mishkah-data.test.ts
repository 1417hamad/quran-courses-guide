import { describe, it, expect } from 'vitest'
import {
  employees,
  units,
  teams,
  services,
  requests,
  posts,
  meetings,
  documents,
  demoPersonas,
} from '@/mishkah/data'

/**
 * البيانات التجريبية لبيئة مشكاة مترابطة بالمعرّفات (موظف ← فريق ← لقاء ← طلب).
 * هذه الاختبارات تحرس ذلك الترابط حتى يبقى تعديل الأسماء أو الإدارات آمنًا.
 */

const employeeIds = new Set(employees.map((e) => e.id))
const unitIds = new Set(units.map((u) => u.id))
const teamIds = new Set(teams.map((t) => t.id))
const serviceIds = new Set(services.map((s) => s.id))

describe('الموظفون', () => {
  it('لكل موظف معرّف فريد', () => {
    expect(employeeIds.size).toBe(employees.length)
  })

  it('كل موظف ينتمي إلى إدارة موجودة', () => {
    for (const e of employees) expect(unitIds.has(e.unitId), `${e.name}: ${e.unitId}`).toBe(true)
  })

  it('كل فريق يذكره الموظف موجود فعلًا', () => {
    for (const e of employees) {
      for (const t of e.teamIds) expect(teamIds.has(t), `${e.name}: ${t}`).toBe(true)
    }
  })

  it('نطاق كل دور يشير إلى إدارة أو فريق أو خدمة موجودة', () => {
    for (const e of employees) {
      for (const r of e.roles) {
        if (!r.ref) continue
        const pool = r.scope === 'unit' ? unitIds : r.scope === 'team' ? teamIds : serviceIds
        expect(pool.has(r.ref), `${e.name}: ${r.role} → ${r.ref}`).toBe(true)
      }
    }
  })

  it('لكل موظف حرفان مختصران وبريد فريد', () => {
    const emails = new Set(employees.map((e) => e.email))
    expect(emails.size).toBe(employees.length)
    for (const e of employees) expect(e.initials.trim().length, e.name).toBeGreaterThan(0)
  })
})

describe('الإدارات والفرق', () => {
  it('مدير كل إدارة موظف موجود وينتمي إليها', () => {
    for (const u of units) {
      expect(employeeIds.has(u.managerId), u.name).toBe(true)
      const manager = employees.find((e) => e.id === u.managerId)!
      expect(manager.unitId, `${u.name}: ${manager.name}`).toBe(u.id)
    }
  })

  it('خدمات كل إدارة موجودة في دليل الخدمات', () => {
    for (const u of units) {
      for (const s of u.serviceIds) expect(serviceIds.has(s), `${u.name}: ${s}`).toBe(true)
    }
  })

  it('قائد كل فريق عضو فيه، وكل الأعضاء موظفون موجودون', () => {
    for (const t of teams) {
      expect(employeeIds.has(t.leadId), t.name).toBe(true)
      expect(t.memberIds, t.name).toContain(t.leadId)
      for (const m of t.memberIds) expect(employeeIds.has(m), `${t.name}: ${m}`).toBe(true)
    }
  })

  it('عضوية الفرق النشطة متطابقة في الاتجاهين', () => {
    // الفريق المؤرشف يحتفظ بسجل أعضائه السابقين دون أن يظهر ضمن فرق الموظف الحالية
    for (const t of teams.filter((x) => x.status === 'active')) {
      for (const m of t.memberIds) {
        const member = employees.find((e) => e.id === m)!
        expect(member.teamIds, `${member.name} ← ${t.name}`).toContain(t.id)
      }
    }
    for (const e of employees) {
      for (const id of e.teamIds) {
        const team = teams.find((t) => t.id === id)!
        expect(team.memberIds, `${team.name} ← ${e.name}`).toContain(e.id)
      }
    }
  })
})

describe('الخدمات والطلبات', () => {
  it('كل خدمة لها إدارة ومسؤول موجودان', () => {
    for (const s of services) {
      expect(unitIds.has(s.ownerUnitId), s.name).toBe(true)
      expect(employeeIds.has(s.ownerId), s.name).toBe(true)
    }
  })

  it('كل طلب يشير إلى خدمة وأشخاص موجودين', () => {
    for (const r of requests) {
      expect(serviceIds.has(r.serviceId), r.ref).toBe(true)
      expect(employeeIds.has(r.requesterId), r.ref).toBe(true)
      expect(employeeIds.has(r.currentOwnerId), r.ref).toBe(true)
      for (const ev of r.timeline) expect(employeeIds.has(ev.actorId), `${r.ref}: ${ev.action}`).toBe(true)
    }
  })

  it('حقول كل طلب معرّفة في نموذج خدمته', () => {
    for (const r of requests) {
      const service = services.find((s) => s.id === r.serviceId)!
      const keys = new Set(service.form.map((f) => f.key))
      for (const k of Object.keys(r.values)) expect(keys.has(k), `${r.ref}: ${k}`).toBe(true)
    }
  })
})

describe('الحائط واللقاءات والوثائق', () => {
  it('كل منشور له كاتب موجود، وكذلك التعليقات والإشارات', () => {
    for (const p of posts) {
      expect(employeeIds.has(p.authorId), p.id).toBe(true)
      for (const c of p.comments) expect(employeeIds.has(c.authorId), `${p.id}: ${c.id}`).toBe(true)
      for (const m of p.mentions ?? []) expect(employeeIds.has(m), `${p.id}: ${m}`).toBe(true)
      if (p.audience.kind === 'unit') expect(unitIds.has(p.audience.ref!), p.id).toBe(true)
      if (p.audience.kind === 'team') expect(teamIds.has(p.audience.ref!), p.id).toBe(true)
    }
  })

  it('كل لقاء له منظّم ومدعوون موجودون', () => {
    for (const m of meetings) {
      expect(employeeIds.has(m.organizerId), m.title).toBe(true)
      for (const i of m.inviteeIds) expect(employeeIds.has(i), `${m.title}: ${i}`).toBe(true)
      if (m.unitId) expect(unitIds.has(m.unitId), m.title).toBe(true)
      if (m.teamId) expect(teamIds.has(m.teamId), m.title).toBe(true)
    }
  })

  it('مجموع ردود الحضور يساوي عدد المدعوين', () => {
    for (const m of meetings) {
      const total = m.attendance.yes + m.attendance.no + m.attendance.pending
      expect(total, m.title).toBe(m.inviteeIds.length)
    }
  })

  it('كل وثيقة لها إدارة مالكة، ومن سجّل اطلاعه موظف موجود', () => {
    for (const d of documents) {
      expect(unitIds.has(d.ownerUnitId), d.title).toBe(true)
      for (const a of d.ackByIds) expect(employeeIds.has(a), `${d.title}: ${a}`).toBe(true)
    }
  })
})

describe('الأدوار التجريبية', () => {
  it('كل حساب في مبدّل الأدوار موظف موجود', () => {
    for (const p of demoPersonas) expect(employeeIds.has(p.id), p.label).toBe(true)
  })

  it('تغطي الحسابات التجريبية الأدوار الأساسية', () => {
    const roles = new Set(
      demoPersonas.flatMap((p) => employees.find((e) => e.id === p.id)!.roles.map((r) => r.role)),
    )
    for (const needed of ['employee', 'unit_manager', 'service_owner', 'sysadmin', 'executive'] as const) {
      expect(roles.has(needed), needed).toBe(true)
    }
  })
})

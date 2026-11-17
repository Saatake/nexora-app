import AppShell from '@/components/AppShell';
import ImageCropModal from '@/components/ImageCropModal';
import { useNewProject } from '@/features/project-form/hooks/useNewProject';
import ProjectFormBasicInfo from '@/features/project-form/components/ProjectFormBasicInfo';
import ProjectFormTeam from '@/features/project-form/components/ProjectFormTeam';
import ProjectFormDescription from '@/features/project-form/components/ProjectFormDescription';
import ProjectFormFiles from '@/features/project-form/components/ProjectFormFiles';
import ProjectFormPrivacy from '@/features/project-form/components/ProjectFormPrivacy';
import ProjectContentBuilder from '@/features/project-form/components/ProjectContentBuilder';

const NewProjectPage = () => {
  const {
    title, setTitle,
    category, setCategory,
    summary, setSummary,
    description, setDescription,
    thematicArea, setThematicArea,
    tags, setTags,
    authorContribution, setAuthorContribution, authorRole, setAuthorRole,
    contentBlocks, setContentBlocks,
    advisor, setAdvisor,
    collaborators, setCollaborators,
    isPrivate, setIsPrivate,
    isSaving,
    error,
    currentUser,
    fileUpload,
    handleSubmit,
  } = useNewProject();

  return (
    <AppShell title="Criar Novo Projeto" subtitle="Preencha as informações abaixo para publicar seu trabalho acadêmico." showSearch={false}>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <ProjectFormBasicInfo
          title={title} setTitle={setTitle}
          category={category} setCategory={setCategory}
          thematicArea={thematicArea} setThematicArea={setThematicArea}
          tags={tags} setTags={setTags}
        />

        <ProjectFormTeam
          collaborators={collaborators}
          setCollaborators={setCollaborators}
          excludeIds={currentUser?.id ? [currentUser.id] : []}
          advisor={advisor}
          setAdvisor={setAdvisor}
          authorContribution={authorContribution}
          setAuthorContribution={setAuthorContribution}
          authorRole={authorRole}
          setAuthorRole={setAuthorRole}
        />

        <ProjectFormDescription
          summary={summary} setSummary={setSummary}
          description={description} setDescription={setDescription}
        />

        <ProjectContentBuilder
          blocks={contentBlocks} onChange={setContentBlocks}
          uploadImage={fileUpload.uploadContentImage}
          uploadDocument={fileUpload.uploadContentDocument}
        />

        <ProjectFormFiles
          coverPreview={fileUpload.coverPreview}
          isUploadingCover={fileUpload.isUploadingCover}
          coverInputRef={fileUpload.coverInputRef}
          onCoverFileSelected={fileUpload.handleCoverFileSelected}
          onRemoveCover={() => { fileUpload.setCoverPreview(null); fileUpload.setImageUrl(''); }}
        />

        <ProjectFormPrivacy isPrivate={isPrivate} setIsPrivate={setIsPrivate} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-[#0a5c2f] hover:bg-[#084925] disabled:bg-green-300 text-white text-sm font-bold rounded shadow transition-colors"
          >
            {isSaving ? 'Publicando...' : 'Publicar projeto'}
          </button>
        </div>
      </form>

      {fileUpload.cropSrc && (
        <ImageCropModal
          imageSrc={fileUpload.cropSrc}
          aspect={16 / 9}
          onConfirm={fileUpload.handleCropConfirm}
          onCancel={() => fileUpload.setCropSrc(null)}
        />
      )}
    </AppShell>
  );
};

export default NewProjectPage;
